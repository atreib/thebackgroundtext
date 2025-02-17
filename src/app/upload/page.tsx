"use client";

export default function UploadPage() {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("File content:", e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Upload Image</h1>

        <form className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          <p className="text-sm text-gray-500">
            Supported formats: JPG, PNG, GIF
          </p>
        </form>
      </div>
    </div>
  );
}
