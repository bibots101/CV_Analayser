import { useState, useEffect } from "react";
import { get_user_info } from "../function";

export const AddJobPage = () => {
    const [userInfo, setUserInfo] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [showPercentage, setShowPercentage] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfoData = await get_user_info();
                setUserInfo(userInfoData.username);
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        fetchUserInfo();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProgress(0);
        setShowPercentage(false);
        setShowMessage(false);
        setSuccessMessage(null);
        setErrorMessage(null);

        const formData = new FormData(e.currentTarget);
        console.log(formData);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setShowPercentage(true);
                    addJobAndSetSuccessMessage(formData);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const addJobAndSetSuccessMessage = async (formData: FormData) => {
        try {
            const response = await fetch("http://127.0.0.1:8000/add_job", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.detail);
                return;
            }
            const data = await response.json();
            console.log(data);
            setSuccessMessage(data.message);
            setTimeout(() => {
                setShowMessage(true);
            }, 500);
        } catch (error) {
            console.error("Error fetching success message:", error);
            setErrorMessage("An unexpected error occurred.");
        }
    };

    return (

        <div className="min-h-screen bg-gray-100">
            <section id="form-section" className="container mx-auto my-8 p-4 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Welcome {userInfo}!</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="job_title" placeholder="Job Title" className="mb-4 p-2 border border-gray-300 rounded w-full" required />
                    <input type="text" name="industry" placeholder="Industry" className="mb-4 p-2 border border-gray-300 rounded w-full" required />
                    <textarea name="job_description" rows={4} placeholder="Job Description" className="mb-4 p-2 border border-gray-300 rounded w-full" required></textarea>
                    <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded">Submit</button>
                </form>
                <div className="relative pt-1 mt-4">
                    <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-gray-200">
                        <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500 ease-out">{progress}%</div>
                    </div>
                </div>
                {showPercentage && successMessage && (
                    <div className="text-5xl font-bold text-center text-blue-500 transition-opacity duration-500 ease-out">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="text-5xl font-bold text-center text-red-500 transition-opacity duration-500 ease-out">
                        {errorMessage}
                    </div>
                )}
            </section>
        </div>
    );
};
