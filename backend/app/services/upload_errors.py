from enum import StrEnum


class UploadErrorCode(StrEnum):
    no_files = "upload_no_files"
    file_too_large = "upload_file_too_large"
    unsupported_file_type = "upload_unsupported_file_type"
    unsupported_content_type = "upload_unsupported_content_type"
    empty_file = "upload_empty_file"
    invalid_png_signature = "upload_invalid_png_signature"
    invalid_jpeg_signature = "upload_invalid_jpeg_signature"
    missing_dicom_marker = "dicom_missing_marker"
    corrupted_dicom = "dicom_corrupted"
    missing_required_metadata = "dicom_missing_required_metadata"
    storage_failed = "upload_storage_failed"


UPLOAD_ERROR_CATALOG: dict[UploadErrorCode, dict[str, str]] = {
    UploadErrorCode.no_files: {
        "message": "No file was selected for upload.",
        "message_fr": "Aucun fichier n'a ete selectionne pour l'upload.",
        "suggestion": "Choose at least one DICOM, PNG, JPG, or JPEG file.",
        "suggestion_fr": "Selectionnez au moins un fichier DICOM, PNG, JPG ou JPEG.",
    },
    UploadErrorCode.file_too_large: {
        "message": "The uploaded file exceeds the configured size limit.",
        "message_fr": "Le fichier depasse la taille maximale configuree.",
        "suggestion": "Upload a smaller file or ask an administrator to increase the limit.",
        "suggestion_fr": "Importez un fichier plus petit ou demandez a un administrateur d'augmenter la limite.",
    },
    UploadErrorCode.unsupported_file_type: {
        "message": "This file extension is not supported.",
        "message_fr": "Cette extension de fichier n'est pas prise en charge.",
        "suggestion": "Use a DICOM, PNG, JPG, or JPEG file.",
        "suggestion_fr": "Utilisez un fichier DICOM, PNG, JPG ou JPEG.",
    },
    UploadErrorCode.unsupported_content_type: {
        "message": "This file content type is not supported.",
        "message_fr": "Ce type de contenu n'est pas pris en charge.",
        "suggestion": "Export the image as DICOM, PNG, JPG, or JPEG and try again.",
        "suggestion_fr": "Exportez l'image en DICOM, PNG, JPG ou JPEG puis reessayez.",
    },
    UploadErrorCode.empty_file: {
        "message": "The uploaded file is empty.",
        "message_fr": "Le fichier importe est vide.",
        "suggestion": "Choose a complete medical image file and try again.",
        "suggestion_fr": "Selectionnez une image medicale complete puis reessayez.",
    },
    UploadErrorCode.invalid_png_signature: {
        "message": "The PNG file signature is invalid.",
        "message_fr": "La signature du fichier PNG est invalide.",
        "suggestion": "Regenerate or re-export the PNG file before upload.",
        "suggestion_fr": "Regenerez ou reexportez le fichier PNG avant l'upload.",
    },
    UploadErrorCode.invalid_jpeg_signature: {
        "message": "The JPEG file signature is invalid.",
        "message_fr": "La signature du fichier JPEG est invalide.",
        "suggestion": "Regenerate or re-export the JPEG file before upload.",
        "suggestion_fr": "Regenerez ou reexportez le fichier JPEG avant l'upload.",
    },
    UploadErrorCode.missing_dicom_marker: {
        "message": "The DICOM preamble marker is missing.",
        "message_fr": "Le marqueur de preambule DICOM est absent.",
        "suggestion": "Verify that the file is a valid DICOM export.",
        "suggestion_fr": "Verifiez que le fichier est bien un export DICOM valide.",
    },
    UploadErrorCode.corrupted_dicom: {
        "message": "The DICOM file appears corrupted or incomplete.",
        "message_fr": "Le fichier DICOM semble corrompu ou incomplet.",
        "suggestion": "Export the DICOM file again from the source system.",
        "suggestion_fr": "Exportez de nouveau le fichier DICOM depuis le systeme source.",
    },
    UploadErrorCode.missing_required_metadata: {
        "message": "The DICOM file is missing required metadata.",
        "message_fr": "Le fichier DICOM ne contient pas les metadonnees obligatoires.",
        "suggestion": "Ensure the DICOM includes required fields such as Modality and PatientID.",
        "suggestion_fr": "Verifiez que le DICOM contient les champs obligatoires comme Modality et PatientID.",
    },
    UploadErrorCode.storage_failed: {
        "message": "The file could not be stored securely.",
        "message_fr": "Le fichier n'a pas pu etre stocke de maniere securisee.",
        "suggestion": "Try again later or contact an administrator if the problem persists.",
        "suggestion_fr": "Reessayez plus tard ou contactez un administrateur si le probleme persiste.",
    },
}


class UploadValidationError(ValueError):
    def __init__(self, code: UploadErrorCode) -> None:
        self.code = code
        super().__init__(UPLOAD_ERROR_CATALOG[code]["message"])


def upload_error_detail(code: UploadErrorCode) -> dict[str, str]:
    return {"code": code.value, **UPLOAD_ERROR_CATALOG[code]}
