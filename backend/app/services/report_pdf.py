from dataclasses import dataclass
from datetime import UTC, datetime
from io import BytesIO
from struct import unpack
from textwrap import wrap
import zlib

from pydicom import dcmread

from app.models.medical_image import MedicalImage
from app.models.user import User


REPORT_TEMPLATE_HTML = """
<article class="medical-report">
  <header>
    <h1>PulmoDiag AI - Rapport d'analyse</h1>
    <p>Rapport genere pour un professionnel de sante autorise.</p>
  </header>
  <section class="result-summary">
    <h2>Resultat</h2>
    <dl>
      <dt>Fichier</dt><dd>{filename}</dd>
      <dt>Diagnostic IA</dt><dd>{prediction}</dd>
      <dt>Confiance</dt><dd>{confidence}</dd>
      <dt>Statut</dt><dd>{status}</dd>
    </dl>
  </section>
  <section class="image-panel">
    <figure>Image source</figure>
    <figure>Heatmap Grad-CAM</figure>
  </section>
</article>
"""

REPORT_TEMPLATE_CSS = """
.medical-report { font-family: Helvetica, Arial, sans-serif; color: #0f172a; }
header, footer { border-color: #0ea5e9; }
.result-summary { border: 1px solid #cbd5e1; padding: 16px; }
.image-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
figure { border: 1px solid #cbd5e1; padding: 8px; }
"""


@dataclass(frozen=True)
class PdfImage:
    name: str
    width: int
    height: int
    data: bytes
    filter_name: str
    color_space: str = "/DeviceRGB"
    bits_per_component: int = 8
    decode_params: str | None = None
    decode: str | None = None


def _pdf_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _format_confidence(value: float | None) -> str:
    return f"{round(value * 100)}%" if value is not None else "N/R"


def _format_prediction(value: str | None) -> str:
    if value == "PNEUMONIA":
        return "Pneumonie detectee"
    if value == "NORMAL":
        return "Aucun signe de pneumonie"
    return "Analyse en attente"


def _jpeg_info(data: bytes) -> tuple[int, int, int]:
    index = 2
    while index + 9 < len(data):
        if data[index] != 0xFF:
            index += 1
            continue
        marker = data[index + 1]
        index += 2
        if marker in {0xD8, 0xD9}:
            continue
        if index + 2 > len(data):
            break
        segment_length = int.from_bytes(data[index : index + 2], "big")
        if marker in {0xC0, 0xC1, 0xC2, 0xC3} and index + 7 < len(data):
            height = int.from_bytes(data[index + 3 : index + 5], "big")
            width = int.from_bytes(data[index + 5 : index + 7], "big")
            components = data[index + 7] if index + 8 <= len(data) else 3
            return width or 512, height or 512, components
        index += max(segment_length, 2)
    return 512, 512, 3


def _png_chunks(data: bytes) -> tuple[int, int, int, int, bytes]:
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError("Not a PNG")
    index = 8
    width = height = bit_depth = color_type = 0
    idat_parts: list[bytes] = []
    while index + 8 <= len(data):
        length = int.from_bytes(data[index : index + 4], "big")
        chunk_type = data[index + 4 : index + 8]
        chunk_data = data[index + 8 : index + 8 + length]
        index += 12 + length
        if chunk_type == b"IHDR":
            width, height = unpack(">II", chunk_data[:8])
            bit_depth = chunk_data[8]
            color_type = chunk_data[9]
        elif chunk_type == b"IDAT":
            idat_parts.append(chunk_data)
        elif chunk_type == b"IEND":
            break
    if not width or not height or not idat_parts:
        raise ValueError("Unsupported PNG")
    return width, height, bit_depth, color_type, b"".join(idat_parts)


def _unfilter_png(raw: bytes, width: int, height: int, channels: int) -> list[bytes]:
    stride = width * channels
    rows: list[bytes] = []
    previous = bytearray(stride)
    offset = 0
    for _ in range(height):
        filter_type = raw[offset]
        offset += 1
        scanline = bytearray(raw[offset : offset + stride])
        offset += stride
        for index in range(stride):
            left = scanline[index - channels] if index >= channels else 0
            above = previous[index]
            upper_left = previous[index - channels] if index >= channels else 0
            if filter_type == 1:
                scanline[index] = (scanline[index] + left) & 0xFF
            elif filter_type == 2:
                scanline[index] = (scanline[index] + above) & 0xFF
            elif filter_type == 3:
                scanline[index] = (scanline[index] + ((left + above) // 2)) & 0xFF
            elif filter_type == 4:
                predictor = left + above - upper_left
                pa = abs(predictor - left)
                pb = abs(predictor - above)
                pc = abs(predictor - upper_left)
                scanline[index] = (scanline[index] + (left if pa <= pb and pa <= pc else above if pb <= pc else upper_left)) & 0xFF
        rows.append(bytes(scanline))
        previous = scanline
    return rows


def _png_to_pdf_image(name: str, data: bytes) -> PdfImage:
    width, height, bit_depth, color_type, idat = _png_chunks(data)
    if bit_depth != 8:
        raise ValueError("Only 8-bit PNG images are supported")
    if color_type == 0:
        return PdfImage(
            name=name,
            width=width,
            height=height,
            data=idat,
            filter_name="/FlateDecode",
            color_space="/DeviceGray",
            decode_params=f"<< /Predictor 15 /Colors 1 /BitsPerComponent 8 /Columns {width} >>",
        )
    if color_type == 2:
        return PdfImage(
            name=name,
            width=width,
            height=height,
            data=idat,
            filter_name="/FlateDecode",
            decode_params=f"<< /Predictor 15 /Colors 3 /BitsPerComponent 8 /Columns {width} >>",
        )
    if color_type == 6:
        rgba_rows = _unfilter_png(zlib.decompress(idat), width, height, 4)
        rgb_rows = [b"\x00" + b"".join(row[index : index + 3] for index in range(0, len(row), 4)) for row in rgba_rows]
        recompressed = zlib.compress(b"".join(rgb_rows))
        return PdfImage(
            name=name,
            width=width,
            height=height,
            data=recompressed,
            filter_name="/FlateDecode",
            decode_params=f"<< /Predictor 15 /Colors 3 /BitsPerComponent 8 /Columns {width} >>",
        )
    raise ValueError("Unsupported PNG color type")


def _dicom_to_pdf_image(name: str, data: bytes) -> PdfImage | None:
    try:
        dataset = dcmread(BytesIO(data), force=True)
        rows = int(dataset.Rows)
        columns = int(dataset.Columns)
        samples_per_pixel = int(getattr(dataset, "SamplesPerPixel", 1))
        bits_allocated = int(getattr(dataset, "BitsAllocated", 8))
        pixel_data = bytes(dataset.PixelData)
    except Exception:
        return None

    if rows <= 0 or columns <= 0 or samples_per_pixel != 1:
        return None

    pixel_count = rows * columns
    if bits_allocated == 8:
        values = list(pixel_data[:pixel_count])
    elif bits_allocated == 16:
        expected = pixel_count * 2
        if len(pixel_data) < expected:
            return None
        values = [int.from_bytes(pixel_data[index : index + 2], "little", signed=False) for index in range(0, expected, 2)]
    else:
        return None

    if not values:
        return None

    minimum = min(values)
    maximum = max(values)
    if maximum == minimum:
        grayscale = bytes([128] * pixel_count)
    else:
        grayscale = bytes(round((value - minimum) * 255 / (maximum - minimum)) for value in values)

    if getattr(dataset, "PhotometricInterpretation", "") == "MONOCHROME1":
        grayscale = bytes(255 - value for value in grayscale)

    return PdfImage(
        name=name,
        width=columns,
        height=rows,
        data=zlib.compress(grayscale),
        filter_name="/FlateDecode",
        color_space="/DeviceGray",
    )


def _bytes_to_pdf_image(name: str, data: bytes | None) -> PdfImage | None:
    if not data:
        return None
    if data.startswith(b"\xff\xd8"):
        width, height, components = _jpeg_info(data)
        if components == 1:
            color_space = "/DeviceGray"
            decode = None
        elif components == 4:
            color_space = "/DeviceCMYK"
            decode = "[1 0 1 0 1 0 1 0]"
        else:
            color_space = "/DeviceRGB"
            decode = None
        return PdfImage(
            name=name,
            width=width,
            height=height,
            data=data,
            filter_name="/DCTDecode",
            color_space=color_space,
            decode=decode,
        )
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return _png_to_pdf_image(name, data)
    return _dicom_to_pdf_image(name, data)


def _fit_rect(width: int, height: int, max_width: float, max_height: float) -> tuple[float, float]:
    ratio = min(max_width / width, max_height / height)
    return width * ratio, height * ratio


def _draw_image_slot(pdf_image: PdfImage | None, x: float, y: float, label: str, placeholder: str) -> list[str]:
    commands = [
        "BT",
        "/F1 11 Tf",
        f"{x} {y + 205} Td",
        f"({_pdf_escape(label)}) Tj",
        "ET",
        "0.80 0.84 0.90 RG",
        f"{x:.2f} {y:.2f} 220 190 re S",
    ]
    if pdf_image is None:
        commands.extend(
            [
                "BT",
                "/F1 9 Tf",
                f"{x + 12:.2f} {y + 94:.2f} Td",
                f"({_pdf_escape(placeholder)}) Tj",
                "ET",
            ]
        )
        return commands

    draw_width, draw_height = _fit_rect(pdf_image.width, pdf_image.height, 212, 182)
    draw_x = x + (220 - draw_width) / 2
    draw_y = y + (190 - draw_height) / 2
    commands.extend(
        [
            "q",
            f"{draw_width:.2f} 0 0 {draw_height:.2f} {draw_x:.2f} {draw_y:.2f} cm",
            f"/{pdf_image.name} Do",
            "Q",
        ]
    )
    return commands


def _report_lines(image: MedicalImage, user: User, generated_at: datetime) -> list[str]:
    return [
        f"Genere le: {generated_at.strftime('%Y-%m-%d %H:%M UTC')}",
        f"Professionnel: {user.full_name}",
        f"Fichier: {image.original_filename}",
        f"Identifiant analyse: PFD-{str(image.id).zfill(5)}",
        "",
        "Resultat diagnostique",
        f"Diagnostic IA: {_format_prediction(image.ai_prediction)}",
        f"Confiance: {_format_confidence(image.ai_confidence)}",
        f"Statut pipeline: {image.status.value}",
        f"Latence IA: {image.ai_latency_ms if image.ai_latency_ms is not None else 'N/R'} ms",
        f"Cas ambigu: {'Oui' if image.is_ambiguous else 'Non'}",
    ]


def generate_report_pdf(
    image: MedicalImage,
    user: User,
    *,
    source_image: bytes | None = None,
    heatmap_image: bytes | None = None,
) -> bytes:
    generated_at = datetime.now(UTC)
    source_pdf_image = _bytes_to_pdf_image("ImSource", source_image)
    heatmap_pdf_image = _bytes_to_pdf_image("ImHeatmap", heatmap_image)
    embedded_images = [item for item in (source_pdf_image, heatmap_pdf_image) if item is not None]

    commands: list[str] = [
        "BT",
        "/F1 18 Tf",
        "50 805 Td",
        "(PulmoDiag AI - Rapport d'analyse) Tj",
        "ET",
        "0.04 0.65 0.91 RG 50 792 m 545 792 l S",
        "BT",
        "/F1 11 Tf",
        "50 765 Td",
        "14 TL",
    ]
    for raw_line in _report_lines(image, user, generated_at):
        wrapped_lines = wrap(raw_line, width=86) if raw_line else [""]
        for line in wrapped_lines:
            commands.append(f"({_pdf_escape(line)}) Tj")
            commands.append("T*")
    commands.append("ET")

    commands.extend(_draw_image_slot(source_pdf_image, 50.0, 300.0, "Image source", "Image source non disponible"))
    commands.extend(_draw_image_slot(heatmap_pdf_image, 325.0, 300.0, "Heatmap Grad-CAM", "Heatmap non disponible"))

    commands.extend(
        [
            "BT",
            "/F1 10 Tf",
            "50 92 Td",
            "(Ce rapport est une aide a la decision. Validation medicale obligatoire.) Tj",
            "ET",
            "0.04 0.65 0.91 RG 50 58 m 545 58 l S",
            "BT",
            "/F1 9 Tf",
            "50 42 Td",
            "(PulmoDiag AI | Rapport confidentiel | Page 1/1) Tj",
            "ET",
        ]
    )
    content_stream = "\n".join(commands).encode("latin-1", errors="replace")

    image_resource_entries: list[str] = []
    image_objects: list[bytes] = []
    first_image_obj = 6
    for offset, pdf_image in enumerate(embedded_images):
        object_number = first_image_obj + offset
        image_resource_entries.append(f"/{pdf_image.name} {object_number} 0 R")
        decode_params = f" /DecodeParms {pdf_image.decode_params}" if pdf_image.decode_params else ""
        decode = f" /Decode {pdf_image.decode}" if pdf_image.decode else ""
        image_objects.append(
            (
                f"<< /Type /XObject /Subtype /Image /Width {pdf_image.width} /Height {pdf_image.height} "
                f"/ColorSpace {pdf_image.color_space} /BitsPerComponent {pdf_image.bits_per_component} "
                f"/Filter {pdf_image.filter_name}{decode_params}{decode} /Length {len(pdf_image.data)} >>\n"
            ).encode("ascii")
            + b"stream\n"
            + pdf_image.data
            + b"\nendstream"
        )

    xobject_resource = f"/XObject << {' '.join(image_resource_entries)} >>" if image_resource_entries else ""
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
            f"/Resources << /Font << /F1 4 0 R >> {xobject_resource} >> /Contents 5 0 R >>"
        ).encode("ascii"),
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(content_stream)).encode("ascii") + b" >>\nstream\n" + content_stream + b"\nendstream",
        *image_objects,
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets: list[int] = []
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n".encode("ascii"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n"
        ).encode("ascii")
    )
    return bytes(pdf)
