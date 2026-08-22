export type Role = 'employee' | 'admin';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'Paid leave' | 'Sick leave' | 'Unpaid leave';
export type Employee = { id:string; name:string; initials:string; email:string; role:Role; title:string; department:string; location:string; joined:string; phone:string; address:string; salary:number; color:string; };
export type Attendance = { id:string; employeeId:string; date:string; checkIn:string; checkOut:string; status:'present'|'late'|'remote'|'absent'; };
export type Leave = { id:string; employeeId:string; employeeName?:string; type:LeaveType; start:string; end:string; days:number; reason:string; status:LeaveStatus; comment?:string; };

export const employees: Employee[] = [
  {id:'DF-1042',name:'Maya Chen',initials:'MC',email:'maya.chen@dayflow.co',role:'employee',title:'Product Designer',department:'Design',location:'San Francisco',joined:'Mar 12, 2022',phone:'+1 415 555 0142',address:'228 Valencia Street, San Francisco, CA',salary:94000,color:'#e58f78'},
  {id:'DF-1001',name:'Avery Morgan',initials:'AM',email:'avery.morgan@dayflow.co',role:'admin',title:'People Operations Lead',department:'People',location:'New York',joined:'Jun 04, 2020',phone:'+1 212 555 0188',address:'18 W 21st Street, New York, NY',salary:128000,color:'#9eb9a8'},
  {id:'DF-1088',name:'Jon Bell',initials:'JB',email:'jon.bell@dayflow.co',role:'employee',title:'Frontend Engineer',department:'Engineering',location:'Austin',joined:'Jan 18, 2023',phone:'+1 512 555 0190',address:'1412 E 5th Street, Austin, TX',salary:112000,color:'#b7a0c9'},
  {id:'DF-1091',name:'Priya Nair',initials:'PN',email:'priya.nair@dayflow.co',role:'employee',title:'Data Analyst',department:'Insights',location:'Chicago',joined:'Aug 22, 2022',phone:'+1 312 555 0114',address:'620 N State Street, Chicago, IL',salary:88000,color:'#d8b36a'},
  {id:'DF-1104',name:'Eli Romero',initials:'ER',email:'eli.romero@dayflow.co',role:'employee',title:'Customer Advocate',department:'Support',location:'Miami',joined:'Nov 07, 2023',phone:'+1 305 555 0171',address:'701 Brickell Avenue, Miami, FL',salary:67000,color:'#84a7bb'},
  {id:'DF-1024',name:'Nina Okafor',initials:'NO',email:'nina.okafor@dayflow.co',role:'employee',title:'Marketing Manager',department:'Marketing',location:'Brooklyn',joined:'Feb 14, 2021',phone:'+1 718 555 0132',address:'77 Wyckoff Avenue, Brooklyn, NY',salary:101000,color:'#c9949d'},
  {id:'DF-1076',name:'Theo Martin',initials:'TM',email:'theo.martin@dayflow.co',role:'employee',title:'Backend Engineer',department:'Engineering',location:'Portland',joined:'Sep 30, 2022',phone:'+1 503 555 0153',address:'428 NW 11th Avenue, Portland, OR',salary:115000,color:'#a7b78a'},
  {id:'DF-1115',name:'Leila Haddad',initials:'LH',email:'leila.haddad@dayflow.co',role:'employee',title:'Content Strategist',department:'Marketing',location:'Boston',joined:'May 09, 2023',phone:'+1 617 555 0162',address:'35 Newbury Street, Boston, MA',salary:79000,color:'#d1a77c'},
  {id:'DF-1018',name:'Sam Whitaker',initials:'SW',email:'sam.whitaker@dayflow.co',role:'employee',title:'Finance Partner',department:'Finance',location:'Denver',joined:'Oct 11, 2020',phone:'+1 303 555 0108',address:'930 17th Street, Denver, CO',salary:106000,color:'#87a4b0'},
  {id:'DF-1130',name:'Camila Torres',initials:'CT',email:'camila.torres@dayflow.co',role:'employee',title:'Recruiter',department:'People',location:'Los Angeles',joined:'Jan 08, 2024',phone:'+1 213 555 0184',address:'401 S Hope Street, Los Angeles, CA',salary:76000,color:'#c8a0b4'},
  {id:'DF-1055',name:'Marcus Lee',initials:'ML',email:'marcus.lee@dayflow.co',role:'employee',title:'Product Manager',department:'Product',location:'Seattle',joined:'Jul 19, 2021',phone:'+1 206 555 0126',address:'92 Pine Street, Seattle, WA',salary:119000,color:'#a5a4c4'},
  {id:'DF-1122',name:'Sofia Petrov',initials:'SP',email:'sofia.petrov@dayflow.co',role:'employee',title:'QA Engineer',department:'Engineering',location:'New York',joined:'Mar 03, 2024',phone:'+1 646 555 0198',address:'220 E 42nd Street, New York, NY',salary:93000,color:'#c5ae7d'},
];
const today = new Date().toISOString().slice(0,10);
export const initialAttendance: Attendance[] = employees.flatMap((e,i) => [{id:`a-${i}`,employeeId:e.id,date:today,checkIn:i===0?'09:08':`08:${42+i}`,checkOut:'',status:i===3?'remote':i===4?'late':'present'}]);
export const initialLeaves: Leave[] = [
  {id:'l-1',employeeId:'DF-1042',type:'Paid leave',start:'2025-04-21',end:'2025-04-23',days:3,reason:'A long weekend with family.',status:'approved'},
  {id:'l-2',employeeId:'DF-1088',type:'Sick leave',start:'2025-04-08',end:'2025-04-08',days:1,reason:'Not feeling well.',status:'approved'},
  {id:'l-3',employeeId:'DF-1091',type:'Paid leave',start:'2025-04-28',end:'2025-05-02',days:5,reason:'Spring break travel.',status:'pending'},
  {id:'l-4',employeeId:'DF-1115',type:'Unpaid leave',start:'2025-04-14',end:'2025-04-16',days:3,reason:'Personal matters.',status:'pending'},
];