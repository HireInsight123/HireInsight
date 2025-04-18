"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = require("../Databases/Database");
const nodemailer_1 = require("nodemailer");
const transporter = (0, nodemailer_1.createTransport)({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
        user: process.env.MailUSERNAME,
        pass: process.env.MAILPASS,
    },
});
function SendMail(result, candidate_id, job_id, role) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Result is :", result);
        const fetchData = () => __awaiter(this, void 0, void 0, function* () {
            // Add role value also to prevent contentation do it in all where applications used
            let query1 = '';
            console.log("The role fetched from the uploads was : ", role);
            if (role == 'Candidate') {
                query1 = `SELECT "firstName","lastName","email","job_Id","status","ResumeAnalysis_Feedback","company_Id" FROM "Candidate_Applications" WHERE "candidate_Id" = $1 AND "job_Id" = $2`;
            }
            else {
                query1 = `SELECT "firstName","lastName","email","job_Id","status","ResumeAnalysis_Feedback","company_Id" FROM "Interviewer_Applications" WHERE "interviewer_Id" = $1 AND "job_Id" = $2`;
            }
            const query2 = `SELECT "role_name" FROM "Jobs" WHERE "id" = $1`;
            const query3 = `SELECT "companyName" FROM "Company" WHERE "company_Id" = $1`;
            const value = [candidate_id, job_id];
            try {
                const response1 = (yield Database_1.Database.query(query1, value)).rows[0];
                console.log("Response 1 is : ", response1);
                let arr = Object.values(response1);
                const response2 = (yield Database_1.Database.query(query2, [job_id])).rows[0].role_name;
                console.log("Response 2 is : ", response2);
                arr.push(response2);
                const response3 = (yield Database_1.Database.query(query3, [arr[6]])).rows[0].companyName;
                console.log("Response 3 is : ", response3);
                arr.push(response3);
                return arr;
            }
            catch (e) {
                console.log(e);
                return;
            }
        });
        const data = yield fetchData();
        if (!data) {
            return;
        }
        else {
            const Candidate_Name = `${data[0]} ${data[1]}`;
            const email = `${data[2]}`;
            const Job_Title = `${data[7]}`;
            const Company_Name = `${data[8]}`;
            const Analysis = `${data[5]}`;
            const decision = result;
            const html = `
            <b>Dear ${Candidate_Name},</b>
            
            <p>Thank you for your interest in the <strong>${Job_Title}</strong> position at <strong>${Company_Name}</strong>. We appreciate the time and effort you put into your application.</p>
            
            <p>After careful consideration of your resume and qualifications, we have decided to <strong>${decision}</strong> your application for the next stage of our hiring process.</p>
            
            ${decision == 'Accepted' ?
                `<p>We were highly impressed with your skills, experience, and overall qualifications. Your background and expertise align well with the role's requirements, and we believe you would be a great addition to our team.</p>
                <p>As a next step we are excited to invite you to the next step of our interview cycle. Over the coming days, you will receive additional details about the interview schedule and any further steps required for onboarding. Please feel free to reach out if you have any questions.</p>`
                :
                    `<p>While we were impressed with your skills and experiences, we have decided to move forward with other candidates whose qualifications more closely align with our current needs. We encourage you to apply again in the future if a role matches your expertise.</p>
                <p>Please know that this decision in no way reflects on your abilities or potential. We were genuinely impressed by your achievements and believe you have a bright future ahead. We encourage you to continue pursuing your goals with the same passion and determination you demonstrated to us.</p>`}
            
            <p>Thank you again for considering a career with ${Company_Name}. We wish you all the best in your future endeavors.</p>
            </hr>
            <p>
            This is an
            Best regards,</br>
            <b>Recruitment Team</b> </br>
            <b>HireInsight</b></br>
            </p>
            <p>
            <small>HireInsight is committed to protecting your personal information. Your information will be collected, used and may be shared by HireInsight with third party service providers to serve lawful purposes, for HireInsight recruitment process, including processing of data by third party when required. Your information shall be held only as long as necessary to achieve the purpose for which it is collected. The use and transfer of your information will be strictly in accordance with the applicable data privacy law and in line with our privacy policy available at privacy policy and Recruiting and Hiring Statement. Further, you agree and acknowledge that you have read HireInsight's privacy policy and fully understand your rights to access, correct erase, object to processing, restrict to processing or withdraw your personal information anytime and seek a copy of the personal information.</small></p>
            `;
            // send mail with defined transport object
            const info = yield transporter.sendMail({
                from: '"HireInsight" <donotreply@email.HireInsight.com>', // sender address
                to: email, // list of receivers
                subject: `Update on ${Job_Title} Application`, // Subject line
                html: html, // html body
            });
            console.log("Message sent: %s", info.messageId);
            // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
        }
    });
}
exports.default = SendMail;
