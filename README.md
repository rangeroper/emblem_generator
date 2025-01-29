# arc_pfp_generator

![arc-pfp (4)](https://github.com/user-attachments/assets/287b1591-b557-49f0-9257-882a4e69a7ee)

upload profile picture and add arc-branded overlays, or apply filters and tints. it generates a png image.

## features:
- **upload your image**: ability to upload an image from your device
- **apply filters**: adjust brightness or contrast to your uploaded image.
- **add overlays**: choose from a set of customizable arc-branded overlays to add to your image.
- **apply tints**: add red, green, or blue tints to change the mood of your profile picture.
- **download**: once your image is customized to your liking, download it as a png

## installation

1. clone the repository:
   ```bash
   git clone https://github.com/yourusername/arc_pfp_generator.git
2. install dependencies
   ```
   npm install
3. run the development server
   ```
   npm run dev

## 🚀 roadmap  

### 🔹 phase 1: enhancements & ux improvements
- [x] **mvp** – users can upload their own image, add from several arc-branded overlays, add/modify basic filters (adjust `brightness` and `contrast` with sliders to modify the image uploaded image); ability to download image as a png.
- [ ] **overlay positioning & sizing** – allow users to adjust overlay placement and scale.  
- [ ] **more filters** – add more advanced filter options like `saturate`, `blur`, `hue-rotate`, etc.  
- [ ] **drag & drop upload** – improve UI/UX by allowing drag-and-drop functionality, while keeping click-to-upload available.  
- [ ] **default images** – let users pick from preset backgrounds (e.g., solid black, gradients) without need to upload an image.  

### 🔹 phase 2: randomization & generation  
- [ ] **generate button** – create a button that randomly chooses from set of preset backgrounds and apply a randomly selected overlay and/or filter

### 🔹 phase 3: experimental features & research  
- [ ] **ai-generated art** – research and integrate tools/plugins for procedural or ai generated images.  
- [ ] **smart overlay matching** – experiment with ways to match filters & overlays based on AI generated image colors.  
