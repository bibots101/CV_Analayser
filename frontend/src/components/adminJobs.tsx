import { useState, useEffect } from "react";
import { AttachmentPage } from "./attachments";
export const AdminJobPage = ({ job }) => {
    const [isDeleted, setIsDeleted] = useState(false);
    const [applys, setApp] = useState([]);
    useEffect(() => {
        fetchJobApply();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        deleteAndSetSuccessMessage();
    };
    const fetchJobApply = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/get_apply/" + job.id, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            console.log(data.applys);
            setApp(data.applys);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };
    const deleteAndSetSuccessMessage = async () => {
        try {
            console.log("http://127.0.0.1:8000/delete_job/" + job.id);
            const response = await fetch("http://127.0.0.1:8000/delete_job/" + job.id, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Error deleting job.");
            }

            const data = await response.json();
            setTimeout(() => {
                setIsDeleted(true)
            }, 500);
        } catch (error) {
            console.error("Error fetching success message:", error);
        }
    };
    if (isDeleted) {
        return null;
    }

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
                <dt className="text-sm font-medium leading-6 text-gray-900">Attachments</dt>
                <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                {applys.length > 0 ? (
                    applys.map((apply) => <AttachmentPage key={apply.id} apply={apply} />)
                ) : (
                    <p>No Applys yet.</p>
                )}
                </ul>
                </dd>
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded"
                    >
                        Delete
                    </button>
                </form>
            </div>
        </div>
    );
};
