import { useState, useEffect } from "react";
import { NavPage } from "../components/nav";
import { AddJobPage } from "../components/addJob";
import {AdminJobPage} from "../components/adminJobs";

export const AdminPage = () => {
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
            
            <NavPage />
            <div>
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button className="nav-link active" id="home-tab" onClick={async () => { await fetchAndSetJobs(); }} data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Jobs</button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">Add Job</button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact-tab-pane" type="button" role="tab" aria-controls="contact-tab-pane" aria-selected="false">Contact</button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className="nav-link" id="disabled-tab" data-bs-toggle="tab" data-bs-target="#disabled-tab-pane" type="button" role="tab" aria-controls="disabled-tab-pane" aria-selected="false" disabled>Disabled</button>
                    </li>
                </ul>
                <div className="tab-content" id="myTabContent">
                    <div className="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabIndex={0}><section className="container mx-auto my-8 p-4 bg-white shadow-lg rounded-lg">
                <h1 className="text-2xl font-bold mb-4">Jobs</h1>
                {jobs.length > 0 ? (
                    jobs.map((job) => <AdminJobPage key={job.id} job={job} />)
                ) : (
                    <p>No jobs available.</p>
                )}
            </section></div>
                    <div className="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabIndex={0}>< AddJobPage />5</div>
                    <div className="tab-pane fade" id="contact-tab-pane" role="tabpanel" aria-labelledby="contact-tab" tabIndex={0}>test</div>
                    <div className="tab-pane fade" id="disabled-tab-pane" role="tabpanel" aria-labelledby="disabled-tab" tabIndex={0}>test</div>
                </div>
            </div>
            
        </div>
    );
};
