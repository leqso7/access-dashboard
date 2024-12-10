import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase ინიციალიზაცია
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(bodyParser.json());

// სტატიკური გვერდის მიტანა
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'request.html'));
});

// გენერირებს უნიკალურ 5-ნიშნა კოდს
function generateVerificationCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// გაუმჯობესებული მოთხოვნის დამუშავება
app.post('/submit-request', async (req, res) => {
  const { firstName, lastName } = req.body;
  
  // თუ არ გადმოეცა სახელი და გვარი, გამოვიყენოთ დროებითი მნიშვნელობები
  const safeFirstName = firstName || 'ავტომატური';
  const safeLastName = lastName || 'მოთხოვნა';
  
  const submittedAt = new Date().toISOString();
  const verificationCode = generateVerificationCode();

  try {
    // დამატებითი შეზღუდვების დაწესება
    const existingRequests = await supabase
      .from('access_request')
      .select('*', { count: 'exact' })
      .eq('first_name', safeFirstName)
      .eq('last_name', safeLastName)
      .eq('status', 'pending');

    if (existingRequests.count >= 3) {
      return res.status(429).json({
        success: false,
        message: 'თქვენ უკვე გაგზავნეთ მაქსიმალური რაოდენობის მოთხოვნა'
      });
    }

    // მონაცემების შენახვა Supabase-ში
    const { data, error } = await supabase
      .from('access_request')
      .insert([
        { 
          first_name: safeFirstName, 
          last_name: safeLastName, 
          submitted_at: submittedAt,
          status: 'pending',
          verification_code: verificationCode
        }
      ])
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      throw error;
    }

    res.json({
      success: true,
      message: 'მოთხოვნა წარმატებით გაიგზავნა',
      requestId: data[0].id,
      verificationCode: verificationCode
    });
  } catch (error) {
    console.error('Request Submission Error:', error);
    res.status(500).json({
      success: false,
      message: 'სისტემური შეცდომა. გთხოვთ სცადოთ მოგვიანებით',
      errorDetails: error.message
    });
  }
});

// მოთხოვნის სტატუსის შემოწმება
app.get('/check-request/:id', async (req, res) => {
  const requestId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('access_request')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) {
      console.error('Supabase Select Error:', error);
      throw error;
    }

    res.json({
      success: true,
      status: data.status
    });
  } catch (error) {
    console.error('Request Status Check Error:', error);
    res.status(500).json({
      success: false,
      message: 'სისტემური შეცდომა. გთხოვთ სცადოთ მოგვიანებით',
      errorDetails: error.message
    });
  }
});

// მოთხოვნის დამოწმება
app.post('/approve-request', async (req, res) => {
  const { requestId, action } = req.body;

  try {
    let result;
    if (action === 'approve') {
      result = await supabase.rpc('approve_access_request', { request_id: requestId });
    } else if (action === 'reject') {
      result = await supabase.rpc('reject_access_request', { request_id: requestId });
    } else {
      throw new Error('Invalid action');
    }

    if (result.error) {
      console.error('Supabase RPC Error:', result.error);
      throw result.error;
    }

    res.json({
      success: true,
      message: `მოთხოვნა ${action === 'approve' ? 'დამოწმებულია' : 'უარყოფილია'}`
    });
  } catch (error) {
    console.error('Request Approval Error:', error);
    res.status(500).json({
      success: false,
      message: 'სისტემური შეცდომა. გთხოვთ სცადოთ მოგვიანებით',
      errorDetails: error.message
    });
  }
});

// მოლოდინში მყოფი მოთხოვნების სია
app.get('/pending-requests', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('access_request')
      .select('*')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true });

    if (error) {
      console.error('Supabase Select Error:', error);
      throw error;
    }

    res.json({
      success: true,
      requests: data
    });
  } catch (error) {
    console.error('Pending Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'სისტემური შეცდომა. გთხოვთ სცადოთ მოგვიანებით',
      errorDetails: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`სერვერი გაშვებულია პორტზე ${PORT}`);
});
