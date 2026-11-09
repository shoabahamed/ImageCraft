# ImageCraft- A Web Based Image Editing Platform

<p align="center">
  <a href="https://youtu.be/Upbi_eWr4W8">
    <img src="./assets/home_page.png" alt="Watch the Demo" width="100%" />
  </a>
  <br/>
  <i>▶ Click the image above to watch the full demo on YouTube</i>
</p>


An advanced real time web application using **GPU** for editing, enhancing, and sharing images.  
Built with **React**, **Fabric Js** on the frontend and **Flask** on the backend, with cloud storage using Cloudinary, subscription-based payment with **Stripe**, and an event-driven **RabbitMQ(CloudAMQP)** pipeline that generates **Voyage AI** embeddings asynchronously for semantic search.




You can find the live link [here](https://pixeltune-theta.vercel.app/). As hosted on free tier, initial requests might experience cold starts and resource heavy AI features might fail to run.

---

## ✨ Features

### 🔑 Authentication

- Email/password signup & login
- Google OAuth login
- JWT-based authentication

### 🖌️ Image Editing Tools

- Supports Any Image Size From Local Disk, Online URL, Canvas JSON File
- Adjust Colors, Details of the image
- Custom Preset Filters
- Reflect, Swirl, Bulge/Pinch Filters, Histogram Equalization, Contrast Stretching
- Add **text** and **shapes**
- Preset Text Templates
- **Crop** and **resize**
- **Style transfer** (with templates & any image)
- **Super resolution** (upscaling)
- **Undo/Redo Feature**

<div align="center">
  <img src="./assets/edit.png" alt="Editing Page" width="600">
  <p>Figure: Main Editing Page</p>
</div>

<div align="center">
  <img src="./assets/filters.png" alt="Color Filters" width="600">
  <p>Figure: Color Filters</p>
</div>

<div align="center">
  <img src="./assets/style_transfer.png" alt="Style Transfer" width="600">
  <p>Figure: Style Transfer</p>
</div>

<div align="center">
  <img src="./assets/super_resolution.png" alt="Super Resolution" width="600">
  <p>Figure: 2X, 3X, 4X Super Resolution</p>
</div>

### 📊 User Dashboard

- Users Projects
- Bookmarks
- Manage Subscriptions
- Reports & Notices
- Access Project Information Dashboard

<div align="center">
  <img src="./assets/profile.png" alt="Profile Page" width="600">
  <p>Figure: Profile Page</p>
</div>

<div align="center">
  <img src="./assets/dashboard.png" alt="Project Dashboard" width="600">
  <p>Figure: Project Dashboard</p>
</div>

### 📸 Gallery

- Share edited images with the community
- Search images through semantic search with text input, powered by **Voyage AI** embeddings
- **Asynchronous embedding pipeline with RabbitMQ**: publishing an image returns instantly while a background worker calls the Voyage AI API and stores the embedding for search
  - Keeps slow external API calls off the Flask request path, so requests stay fast
  - Handles Voyage API rate limits and transient failures with retries instead of lost jobs
  - Workers scale independently of the web server
- Sort by **bookmarks** and **views**
- **Like** / **rate** images
- **Report** inappropriate content
- Pagination

<div align="center">
  <img src="./assets/gallery.png" alt="Gallery" width="600">
  <p>Figure: Gallery</p>
</div>

**TODO**: **Find similar images using semantic search with image input**

### 👨‍💻 Admin Dashboard

- Review and manage reported images
- Manage Admins
- Add New Text and Style Transfer Templates

<div align="center">
  <img src="./assets/admin.png" alt="Admin Management" width="600">
  <p>Figure: Admin Management</p>
</div>

<div align="center">
  <img src="./assets/admin_text.png" alt="Add Templates" width="600">
  <p>Figure: Add Templates</p>
</div>

### 💳 Subscription System

- **Stripe integration** for subscription plans
- Webhooks to:
  - Update subscription plans
  - Subscription Cancellations
  - Reset user quotas (`style_completion` and `upscale_completion`)

<div align="center">
  <img src="./assets/pricing.png" alt="Pricing" width="600">
  <p>Figure: Pricing</p>
</div>

<div align="center">
  <img src="./assets/stripe.png" alt="Stripe Subscription" width="600">
  <p>Figure: Stripe Subscription</p>
</div>

<div align="center">
  <img src="./assets/current_plan.png" alt="Current Plan" width="600">
  <p>Figure: Current Plan</p>
</div>

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), TailwindCSS, Fabric.js, WebGL
- **Backend:** Flask
- **Message Queue:** RabbitMQ (producer/consumer workers for async embedding generation)
- **Embeddings:** Voyage AI
- **Database:** MongoDB
- **Storage:** Cloudinary
- **Auth:** JWT + Google OAuth
- **Payments:** Stripe
- **Deployment:** Vercel, Render

<br>

# LICENSE

[MIT LICENSE](LICENSE)