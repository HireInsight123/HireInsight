"use strict";
// Collect CandidateId(for the req itself) and InterviewwId(Find the Interviewer List and alot randomly in them) and JobId(from then req itself) and CandiateName and InterviewerName
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
// Get Candidate and Interviewer's name
const FindCandidateDetail = `SELECT CONCAT("firstName",' ',"lastName") AS "name" FROM "Candidate_Applications" WHERE "candidate_Id" = $1 AND "job_Id" = $2`;
const FindInterviewerDetail = `SELECT CONCAT("firstName",' ',"lastName") AS "name","interviewer_Id" FROM "Interviewer_Applications" WHERE "job_Id" = $1`;
const SetInterview = `INSERT INTO "Interview" ("Candidate_Id","Interview_Id","Job_Id","Meeting_Link","Candidate_Name","Interviewer_Name") VALUES ($1,$2,$3,$4,$5,$6)`;
function ScheduleInterview(candidate_id, job_id) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("On the Schedule Interview Part of the Process");
        console.log("Candidate Id is : ", candidate_id);
        console.log("Job Id is : ", job_id);
        const value1 = [candidate_id, job_id];
        let response = yield Database_1.Database.query(FindCandidateDetail, value1);
        const CandiateRow = response.rows[0];
        // console.log(CandiateRow)
        console.log("Candidate Name is : ", CandiateRow.name);
        // const CandidateName = `${CandiateRow.firstName} ${CandiateRow.lastName}`;
        // console.log("Candidate Name is : ", CandidateName);
        const value2 = [job_id];
        response = yield Database_1.Database.query(FindInterviewerDetail, value2);
        if (!response.rows.length) {
            console.log("No interviewer found");
            return;
        }
        const RandomNumber = Math.floor(Math.random() * (response.rows.length));
        const InterviewerDetail = response.rows[RandomNumber];
        console.log("Interview Details are : ", InterviewerDetail);
        // Generate Meeting Link
        const clientId = process.env.ZOOMCLIENTID;
        const clientSecret = process.env.ZOOMCLIENTSECRET;
        const base64String = btoa(clientId + ':' + clientSecret);
        const accountId = process.env.ZOOMACCOUNTID;
        let MeetingLink = '';
        const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`;
        fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + base64String
            }
        })
            .then(response => response.json())
            .then(data => {
            const accessToken = data.access_token;
            console.log('Access Token:', accessToken);
            // Now that we have the token, we can make the second request
            const meetingData = {
                topic: 'Zoom meeting for something.',
                type: 2, // 2 for scheduled meeting
                start_time: new Date('2024-09-30T10:30:00Z').toISOString(),
                duration: 30
            };
            return fetch(`https://api.zoom.us/v2/users/me/meetings`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(meetingData)
            });
        })
            .then(response => response.json())
            .then((data) => __awaiter(this, void 0, void 0, function* () {
            // console.log('Meeting Created:', data);
            MeetingLink = data.join_url;
            // INSETING TO THE TABLE
            try {
                const value = [candidate_id, InterviewerDetail.interviewer_Id, job_id, MeetingLink, CandiateRow.name, InterviewerDetail.name];
                yield Database_1.Database.query(SetInterview, value);
            }
            catch (e) {
                console.log("Error occured while Interting detailes in Database!! ");
                console.log(e);
            }
        }))
            .catch(error => {
            console.error('Error:', error);
        });
    });
}
exports.default = ScheduleInterview;
