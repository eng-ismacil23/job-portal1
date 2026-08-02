import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Jobs.css";


function Jobs(){

const [jobs,setJobs] = useState([]);


useEffect(()=>{

const data = JSON.parse(
localStorage.getItem("jobs")
) || [];


setJobs(data);


},[]);



return(

<div className="jobs-page">

<h1>JobPortal</h1>

<div className="jobs-container">


{
jobs.length === 0 ? (

<p className="no-jobs">
No Jobs Available
</p>

)

:

(

jobs.map((job)=>(

<div className="job-card" key={job.id}>


<h2>{job.title}</h2>


<p>
<strong>Company:</strong> {job.company}
</p>


<p>
<strong>Location:</strong> {job.location}
</p>


<p>
<strong>Salary:</strong> {job.salary}
</p>



<Link to={`/jobs/${job.id}`}>

<button>
View Details
</button>

</Link>


</div>

))

)

}


</div>

</div>

)

}


export default Jobs;