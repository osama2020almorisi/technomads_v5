import {NextResponse} from 'next/server';export async function GET(){return NextResponse.json({status:'ok',service:'YUNES Travel & Education',time:new Date().toISOString()})}
