import { useState } from "react";
export const JobPage = ({ job }) => {
    const [progress, setProgress] = useState(0);
    const [showPercentage, setShowPercentage] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProgress(0);
        setShowPercentage(false);
        setShowMessage(false);
        setSuccessMessage(null);

        const formData = new FormData(e.currentTarget);
        const fileInput = e.currentTarget.querySelector('#cvUpload') as HTMLInputElement;
        const file = fileInput.files[0];
        formData.append('cv_file_name', file.name);

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setShowPercentage(true);
                    fetchAndSetSuccessMessage(formData);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };
    const fetchAndSetSuccessMessage = async (formData: FormData) => {
        try {
            
            formData.append('job_id', job.id);
            const response = await fetch("http://127.0.0.1:8000/apply_job", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Error fetching success message.");
            }

            const data = await response.json();
            console.log(data);
            setSuccessMessage(data.score);
            setTimeout(() => {
                setShowMessage(true);
            }, 500);
        } catch (error) {
            console.error("Error fetching success message:", error);
        }
    };

    return (
        <div className="box-border border-solid p-4 border-2 border-black mb-8">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Title</dt>
                <dd className="mt-1 text-xl leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {job.title}
                </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                    industry
                </dt>
                <dd className="mt-1 text-xl leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {job.industry}
                </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                    Description
                </dt>
                <dd className="mt-1 text-base leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {job.description}
                </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                    Attachments
                </dt>
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <label
                        htmlFor="cvUpload"
                        className="block text-gray-700 font-bold mb-2"
                    >
                        Upload Your CV
                    </label>
                    <input
                        type="file"
                        id="cvUpload"
                        name="cv_file"
                        className="mb-4 p-2 border border-gray-300 rounded w-full"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded"
                    >
                        Submit
                    </button>
                </form>
                <div className="relative pt-1 mt-4">
                    <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-gray-200">
                        <div
                            style={{ width: `${progress}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500 ease-out"
                        >
                            {progress}%
                        </div>
                    </div>
                </div>
                {showPercentage && (
                    <div className="text-5xl font-bold text-center text-blue-500 transition-opacity duration-500 ease-out">
                        {successMessage}%
                    </div>
                )}
            </div>
        </div>
    );
};
