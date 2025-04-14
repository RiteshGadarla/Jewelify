#  **Jewellery Design Pattern Generation** 

## **Overview**  
This Project is a cutting-edge application designed to transform ✏️ artistic jewelry sketches into realistic gold jewelry images. It also empowers users to unleash their creativity by generating stunning jewelry visuals from text prompts 💬 and organizing them in a personalized collection 📂.

---

## **Features**  

✨ **1. Sketch-to-Jewelry Transformation**  
   Upload an artistic jewelry sketch, and the system generates a realistic gold jewelry image.  

🖌️ **2. Text-to-Image Generation**  
   Enter a descriptive text prompt to create visually captivating jewelry designs based on your imagination.  

📁 **3. Personalized Collections**  
   Manage and view all the generated jewelry images in one organized place.

---

## **Installation Instructions**  

### **⚙️ Prerequisites**  

1. **Node.js** (required for the frontend and backend API integration).  
2. **Python 3.8+** (required for backend AI functionalities, such as image processing and text-to-image generation).  
3. Ensure **pip** (Python package manager) is installed and up-to-date.  

---

### **🛠️ Steps**  

#### **1. 📥 Download the Model**  
- Download the trained `.h5` model from [this link](https://drive.google.com/file/d/1FFodj1KsoHN1KyNaPr5T_0WbR3CCn1UL/view?usp=sharing).  
- Place the downloaded file in the `api/model/` folder.  
- Ensure that the file name is **`generator.h5`**.  

---

#### **2. 📦 Install Node.js Dependencies**  
- Open a terminal and navigate to the project directory.  
- Run the following command to install all required dependencies:  
  ```bash
  npm install
  ```

---

#### **3. 🐍 Install Python Dependencies**    
- Install the necessary Python packages using the following command:  
  ```bash
  pip install flask flask-cors numpy pillow opencv-python keras accelerate transformers diffusers tensorflow torch torchvision torchaudio
  ```

---

#### **4. 🚀 Start the Application**  

**Option 1: Run the Entire Application (Frontend, Backend, and Flask API)**  
Start the full stack, including the Flask API, backend, and client:  
```bash
npm start
```

**Option 2: Run Only the Backend (Non-Flask) and Client**  
Run only the backend (excluding the Flask API) and the client:  
```bash
npm run web
```


## **📌 Notes**  

- Ensure the `.h5` model is correctly placed in the `api/model` folder before starting the application.  
- Follow the installation steps carefully to avoid dependency-related issues.  
- Use the provided commands to start and run the project seamlessly.  

---

🎉 Enjoy transforming your jewelry ideas into breathtaking realities with this Project! ✨💎  

--- 
