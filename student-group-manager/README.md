# Student Group Manager

სტუდენტების ჯგუფების მართვის სისტემა, რომელიც საშუალებას გაძლევთ მართოთ სტუდენტები და მათი ჯგუფები.

## ფუნქციონალობა

- მოთხოვნის გაგზავნა წვდომისთვის
- სტუდენტების დამატება და მართვა
- ჯგუფების შექმნა და მართვა
- სტუდენტების ჯგუფებში განაწილება

## ტექნოლოგიები

- React
- TypeScript
- Vite
- Material-UI
- Supabase

## დაყენების ინსტრუქცია

1. დააკლონირეთ რეპოზიტორია:
```bash
git clone [repository-url]
cd student-group-manager
```

2. დააინსტალირეთ დამოკიდებულებები:
```bash
npm install
```

3. შექმენით .env ფაილი და დაამატეთ Supabase-ის კონფიგურაცია:
```env
VITE_SUPABASE_URL=https://loyzwjzsjnikmnuqilmv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxveXp3anpzam5pa21udXFpbG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1NzY2OTMsImV4cCI6MjA0OTE1MjY5M30.vwXqtGwm4SG1juWZ_YxMhhZZSiQ7TbtUcB77h6wNYus
```

4. გაუშვით პროექტი:
```bash
npm run dev
```

## გამოყენება

1. გახსენით აპლიკაცია ბრაუზერში
2. შეიყვანეთ სახელი და გვარი მოთხოვნის გასაგზავნად
3. დაელოდეთ ადმინისტრატორის დადასტურებას
4. დადასტურების შემდეგ შეგიძლიათ დაიწყოთ სტუდენტების და ჯგუფების მართვა

## Supabase სტრუქტურა

ცხრილი `access_requests`:
- id (UUID)
- first_name (string)
- last_name (string)
- status (string: 'pending' ან 'approved')
- created_at (timestamp)
- approved_at (timestamp)

## ლიცენზია

MIT
