<a name="readme-top"></a>

<!-- PROJECT HEADER -->
<br />
<div align="center">
  <a href="https://github.com/qu8n/FocusBeacon">
    <img src="public/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">FocusBeacon</h3>

  <p align="center">
    Get detailed stats on your Focusmate sessions
    <br />
    <a href="https://focusbeacon.vercel.app/">View Demo</a>
    ·
    <a href="https://github.com/qu8n/FocusBeacon/issues">Report Bug</a>
    ·
    <a href="https://github.com/qu8n/FocusBeacon/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#local-installation">Local Installation</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

👋🏼 Hi! I'm building this open-sourced dashboard to discover more detailed stats on our past FocusMate sessions.

FocusMate has been life-changing for me. I'm hoping that this dashboard will be a reminder of our past effort and motivate us all towards your goals.

More metrics and features are on the way. Stay tuned and please support by giving this project a star.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* React
* Tremor
* Headless UI
* TailwindCSS
* HeroIcons
* Vercel
* Focusmate API

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

Below are only instructions on how to get this dashboard up and running on your local machine. 

I'm in talks with Focusmate to set up OAuth, which would allow any Focusmate user to login with their Focusmate account and access their data.

### Local Installation

1. Log in to your Focusmate account
2. Navigate to your profile [settings](https://www.focusmate.com/profile/edit-p)
3. Click on `Generate API key` and copy the API key
4. Clone this repo
   ```sh
   git clone https://github.com/qu8n/FocusBeacon.git
   ```
5. Navigate to the project directory
   ```sh
   cd FocusBeacon
   ```
6. Install NPM packages
   ```sh
   npm install
   ```
7. Create an `.env` file in the root directory
   ```sh
   touch .env
   ```
8. Enter your API key in `.env`
   ```
   NEXT_PUBLIC_FOCUSMATE_API_KEY="YOUR_API_KEY"
   ```
9. Run the app
   ```sh
   npm start
   ```
10. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

If you have a suggestion that would make this better, feel free to fork the repo and create a pull request. 
You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

[Quan Nguyen](https://www.quans.org/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>