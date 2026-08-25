export async function downloadFileFromStorage(
    downloadUrl: string
): Promise<Blob> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const finalUrl = downloadUrl.startsWith("http")
        ? downloadUrl
        : `${supabaseUrl}/storage/v1${downloadUrl}`;

    const response = await fetch(finalUrl, {
        method: "GET",
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Download fallito: ${response.status} - ${errorText}`
        );
    }

    return await response.blob();
}