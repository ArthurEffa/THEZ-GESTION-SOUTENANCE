import uuid
from django.core.files.storage import Storage
from django.conf import settings
from supabase import create_client


class SupabaseStorage(Storage):
    """Custom Django storage backend for Supabase Storage."""

    def __init__(self):
        self.client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        self.bucket = settings.SUPABASE_STORAGE_BUCKET

    def _save(self, name, content):
        # Generer un nom unique pour eviter les conflits
        ext = name.rsplit('.', 1)[-1] if '.' in name else ''
        unique_name = f"{name.rsplit('.', 1)[0]}_{uuid.uuid4().hex[:8]}.{ext}" if ext else f"{name}_{uuid.uuid4().hex[:8]}"

        file_bytes = content.read()
        content_type = getattr(content, 'content_type', 'application/octet-stream')

        self.client.storage.from_(self.bucket).upload(
            path=unique_name,
            file=file_bytes,
            file_options={"content-type": content_type}
        )
        return unique_name

    def url(self, name):
        return self.client.storage.from_(self.bucket).get_public_url(name)

    def exists(self, name):
        return False

    def delete(self, name):
        self.client.storage.from_(self.bucket).remove([name])

    def size(self, name):
        return 0
