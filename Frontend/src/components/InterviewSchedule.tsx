import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Video } from 'lucide-react';
import axios from 'axios';

// Mock data for interviews
// const mockInterviews = [
//   {
//     id: 1,
//     InterviewerName: 'Alice Johnson',
//     position: 'Senior Frontend Developer',
//     date: '2024-03-20',
//     time: '10:00 AM',
//     type: 'Technical Interview',
//     platform: 'Zoom',
//     meetingLink: 'https://zoom.us/j/123456789',
//   },
//   // Add more mock interviews
// ];

interface InterviewData {
    id: number,
    Candidate_Id: number,
    Interview_Id: number,
    Job_Id: number,
    meetingLink: string,
    InterviewerName: string,
    date: string,
    time: string,
    position: string,
    type: string,
    platform: string
  }

export default function InterviewSchedule() {
  const [Interviews , setInterviews] = useState<InterviewData[]>([]);

  useEffect(()=>{

    const fetchData = async()=>{
      try{

        const response = await axios.get(`http://localhost:${import.meta.env.VITE_PORT}/api/v1/GetInterviews`,{withCredentials : true});
        const information : InterviewData[] = response.data.information; 
        console.log(information)

        setInterviews(information);
      }catch(e){
        console.log(e)
      }
    };
    fetchData();


  },[])



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {Interviews.map((interview) => (
          <div
            key={interview.id}
            className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {interview.type} - {interview.position}
                </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    <span>{interview.InterviewerName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{interview.date}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{interview.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Video className="h-4 w-4" />
                    <span>{interview.platform}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Join Meeting
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}