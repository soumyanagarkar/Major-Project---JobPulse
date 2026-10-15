import {createContext,useState} from "react";


export const SignupContext = createContext();


export function SignupProvider({children}){


const [signupData,setSignupData]=useState({

fullName:"",
email:"",
password:"",

resume:"",

targetRole:"",
lookingFor:"",
preferredLocation:""

});


return(

<SignupContext.Provider
value={{
signupData,
setSignupData
}}
>

{children}

</SignupContext.Provider>

)

}