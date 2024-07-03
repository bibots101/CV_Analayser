import { useState, useEffect } from "react";
import { get_user_info } from "../function";
import { JobPage } from "../components/job";
import {NavPage} from "../components/nav";

export const HomePage = () => {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        fetchAndSetJobs();
    }, []);

    const fetchAndSetJobs = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/get_jobs", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setJobs(data.jobs);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-100">
            <NavPage/>
            <section className="container mx-auto my-8 p-4 bg-white shadow-lg rounded-lg">
                <h1 className="text-2xl font-bold mb-4">Jobs</h1>
                {jobs.length > 0 ? (
                    jobs.map((job) => <JobPage key={job.id} job={job} />)
                ) : (
                    <p>No jobs available.</p>
                )}
            </section>
        </div>
    );
};
