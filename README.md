# ImageCraft

![HomePage](./assets/home_page.png)

An advanced real time web application using **GPU** for editing, enhancing, and sharing images.  
Built with **React (Vite)** on the frontend and **Flask** on the backend, with cloud storage using cloudnary and subscription based payemnt with **Stripe**

You can find the project demo [here](). As it is a free service backend may not work.

---

## ✨ Features

### 🔑 Authentication

- Email/password signup & login
- Google OAuth login
- JWT-based authentication

### 🖌️ Image Editing Tools

- Supports Any Image Size From Local Disk, Online Url, Canvas Json File
- Adjust Colors, Details and of the image
- Custom Preset Filters
- Reflect, Swril, Bulge/Pinch Filters, Histogram Equlization, Contrast Streching
- Add **text** and **shapes**
- Preset Text Templates
- **Crop** and **resize**
- **Style transfer** (with templates & any image)
- **Super resolution** (upscaling)
- **Undo Redo Feature**

<figure style="text-align: center;">
  <img src="./assets/edit.png" alt="Editing Page">
  <figcaption >Figure: Main Editing Page</figcaption>
</figure>

<figure style="text-align: center;">
  <img src="./assets/filters.png" alt="Style Transfer">
  <figcaption>Figure: Color Filters</figcaption>
</figure>

<figure style="text-align: center;">
  <img src="./assets/style_transfer.png" alt="Style Transfer">
  <figcaption>Figure: Style Transfer</figcaption>
</figure>

<figure style="text-align: center;">
  <img src="./assets/super_resolution.png" alt="Style Transfer">
  <figcaption>Figure: 2X, 3X, 4X Super Resolution</figcaption>
</figure>

### 📊 User Dashboard

- Users Projects
- Bookmarks
- Manage Subscriptions
- Reports & Notices
- Access Project Informations Dashboard
- Manage Subscriptions

<figure style="text-align: center;">
  <img src="./assets/profile.png" alt="HomePage">
  <figcaption>Figure: Profile Page</figcaption>
</figure>

<figure style="text-align: center;">
  <img src="./assets/dashboard.png" alt="HomePage">
  <figcaption>Figure: Project Dashboard</figcaption>
</figure>

### 📸 Gallery

- Share edited images with the community
- Sort by **bookmarks** and **views**
- **Like** / **rate** images
- **Report** inappropriate content
- Pagination

<figure style="text-align: center;">
  <img src="./assets/gallery.png" alt="HomePage">
  <figcaption>Figure: Gallery</figcaption>
</figure>

**TODO**: **Find similar images using semantic search**

### 👨‍💻 Admin Dashboard

- Review and manage reported images
- Manage Admins
- Add New Text and style Transfer Templates

<figure style="text-align: center;">
  <img src="./assets/admin.png" alt="HomePage">
  <figcaption>Figure: Admin Management</figcaption>
</figure>

<figure style="text-align: center;">
  <img src="./assets/admin_text.png" alt="HomePage">
  <figcaption>Figure: Add Templates</figcaption>
</figure>

### 💳 Subscription System

- **Stripe integration** for subscription plans
- Webhooks to:
  - Update subscription plains
  - Subscription Cancellations
  - Reset user quotas (`style_completion` and `upscale_completion`)

<figure style="text-align: center;">
  <img src="./assets/pricing.png" alt="HomePage">
  <figcaption>Figure: Pricing</figcaption>
</figure>

<figure style="text-align: center;">
  <img src="./assets/stripe.png" alt="HomePage">
  <figcaption>Figure: Stripe Subscription</figcaption>
</figure>

<figure style="text-align: center;">
  <img src="./assets/current_plan.png" alt="HomePage">
  <figcaption>Figure: Current Plan</figcaption>
</figure>

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), TailwindCSS, Fabric.js, WebGL
- **Backend:** Flask
- **Database:** MongoDB
- **Storage:** Cloudinary
- **Auth:** JWT + Google OAuth
- **Payments:** Stripe
- **Deployment:** Vercel, Render

<br>

# LICENSE

[MIT LICENSE](LICENSE)
