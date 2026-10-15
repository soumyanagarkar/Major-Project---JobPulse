import "./HowItWorks.css";

import {
  FaUserPlus,
  FaFileUpload,
  FaBrain,
  FaChartLine,
  FaRocket
} from "react-icons/fa";


function HowItWorks(){

const steps=[
{
icon:<FaUserPlus/>,
number:"01",
title:"Create Account",
description:
"Start your career journey by creating your personalized JobPulse AI profile."
},

{
icon:<FaFileUpload/>,
number:"02",
title:"Upload Resume",
description:
"Upload your resume and allow AI to understand your skills, experience and projects."
},

{
icon:<FaBrain/>,
number:"03",
title:"AI Analysis",
description:
"Our AI analyzes your profile and identifies strengths, opportunities and career paths."
},

{
icon:<FaChartLine/>,
number:"04",
title:"Get Career Dashboard",
description:
"Access personalized insights, job matches and career improvement suggestions."
},

{
icon:<FaRocket/>,
number:"05",
title:"Apply Smarter",
description:
"Find suitable opportunities and apply with AI-powered recommendations."
}

];


return(

<section className="how-section" id="how-it-works">

<div className="how-header">

<p className="section-tag">
HOW IT WORKS
</p>

<h2>
Your AI-Powered Career Journey
</h2>

<p>
From creating your profile to landing opportunities,
JobPulse AI guides you at every step.
</p>

</div>



<div className="timeline">


<div className="timeline-line"></div>


{
steps.map((step,index)=>(

<div 
className={`timeline-item ${
index%2===0 ? "left":"right"
}`}
key={index}
>


<div className="timeline-dot">
{step.icon}
</div>



<div className="timeline-card">


<div className="step-number">
{step.number}
</div>


<h3>
{step.title}
</h3>


<p>
{step.description}
</p>


</div>


</div>

))
}


</div>


</section>

)

}


export default HowItWorks;