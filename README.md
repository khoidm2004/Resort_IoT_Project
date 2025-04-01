# Resort IoT Project
- Description: IoT Systems to monitor and optimize client experiences through real-time data collection and analysis for Rakkaranta Resort
- Project Plan: [Click me](https://docs.google.com/document/d/1vz9tLRpypTU9uM9G4ihlC5_up3aLX_hIG-VuaEh0TEQ/edit?tab=t.0)
- Project Overview: [Click me](https://lucid.app/lucidspark/311019a9-9826-4a07-843d-31d3149aea7b/edit?viewport_loc=-2605%2C-725%2C5736%2C2862%2C0_0&invitationId=inv_e5ac8059-44e0-4522-8414-aec9af867c27)
- Sprint 1 video: [Click me](https://youtu.be/qBJvL6tO-qg)

## Authors 👷
- [Khoi Do](https://github.com/khoidm2004) (Project Manager + Backend Dev+  Tester + Deployer)
- [Dung Nguyen](https://github.com/pingviini314159) (IoT Dev)
- [Thong Truong](https://github.com/truonghoangthong) (Backend Dev + IoT Dev + Deployer)
- [Nhi Nguyen](https://github.com/nhingnguyen) (Designer + Frontend Dev)

## [Demo▶️](https://drive.google.com/drive/folders/1WDxwJbH2DybVhDekEtNLBAzu7ruS1jE6?usp=drive_link)

## Deploy
- Step 1: Push to Git
- Step 2: Create a Vercel config file with the following code to rewrite all the paths:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
- Step 3: Log in to Vercel and create a new project by pressing "Add New" => Project <br/><br/>
![image](https://github.com/user-attachments/assets/72f8a5dd-a4d9-45a2-8f19-8b31f50fd8e8)

- Step 4: Choose the project to import <br/><br/>
![image](https://github.com/user-attachments/assets/ddd8d7df-0ed4-4535-bfac-27525793d399)

- Step 5: Choose the `Vercel Team` => `Project Name` => `Framework Preset` (It will automatically choose if there is only a Frontend directory) => `Root Directory` (Directory with the Frontend apps) => Insert `Environment Variables` (Copy all and paste) => `Deploy` <br/><br/>
![image](https://github.com/user-attachments/assets/5dad939f-e2cf-4f0e-8756-72b57d853c38)

Note:
- The web app is deployed if the status is `Ready` <br/><br/>
![image](https://github.com/user-attachments/assets/e1eeaf19-f62d-4b41-8dd2-dff6b2d666b9)
- In case you are having trouble deploying, go to `Build Logs` and inspect the logs to fix <br/><br/>
![image](https://github.com/user-attachments/assets/bca9f42a-203f-4ade-afb3-9cb879dcfde7)







