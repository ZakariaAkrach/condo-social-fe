export async function uploadFileToStorage(file: File, uploadUrl: string): Promise<void> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const finalUrl = uploadUrl.startsWith("http")
        ? uploadUrl
        : `${supabaseUrl}/storage/v1${uploadUrl}`;

    const response = await fetch(finalUrl, {
        method: "PUT",
        body: file,
        headers: {
            "Content-Type": file.type || "application/octet-stream",
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload fallito: ${response.status} - ${errorText}`);
    }
}