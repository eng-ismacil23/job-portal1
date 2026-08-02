import { Link } from "react-router-dom";
import "./Companies.css";

function Companies() {

  const companies = [
    {
      id: 1,
      name: "Google",
      location: "California",
      jobs: 12,
    },
    {
      id: 2,
      name: "Microsoft",
      location: "Washington",
      jobs: 8,
    },
    {
      id: 3,
      name: "Amazon",
      location: "Seattle",
      jobs: 15,
    },
    {
      id: 4,
      name: "Meta",
      location: "New York",
      jobs: 6,
    },
    {
      id: 5,
      name: "Apple",
      location: "California",
      jobs: 10,
    },
    {
      id: 6,
      name: "Netflix",
      location: "Los Angeles",
      jobs: 5,
    },
  ];

  return (
    <div className="companies-page">

      <h1>Companies</h1>

      <div className="companies-container">

        {companies.map((company) => (

          <div
            className="company-card"
            key={company.id}
          >
            <div className="company-logo">
              {company.name.charAt(0)}
            </div>

            <h2>{company.name}</h2>

            <p>
              {company.location}
            </p>

            <p>
               {company.jobs} Jobs Available
            </p>

            <Link
              to={`/company/${company.name}`}
            >
              <button>
                View Jobs
              </button>
            </Link>
          </div>
        ))}

      </div>

    </div>
  );
}

export default Companies;