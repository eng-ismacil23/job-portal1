import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./JobDetails.css";

function JobDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);

  useEffect(() => {
    const jobs =
      JSON.parse(localStorage.getItem("jobs")) || [];

    const selectedJob = jobs.find(
      (j) => j.id === Number(id)
    );

    setJob(selectedJob);
  }, [id]);

  if (!job) {
    return <h2>Job Not Found</h2>;
  }

  return (
    <div className="job-details">
      <h1>{job.title}</h1>

      <p> Company: {job.company}</p>

      <p>Location: {job.location}</p>

      <p>Salary: {job.salary}</p>

      <p>
        We are looking for a talented developer to
        join our team.
      </p>

      <Link to="/apply">
        <button className="apply-btn">
          Apply Now
        </button>
      </Link>
    </div>
  );
}

export default JobDetails;