import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-scroll";
import "./style.css";
import Home_page_pic from "./home_page_pic.png";

export default function Home() {
    const [username, setUsername] = useState();
    const [showOptions, setShowOptions] = useState(false);
    const navigate = useNavigate();

    function loginRedirect() {
        console.log("navbar button");
        navigate('/account/login');
    }

    function signUpRedirect() {
        if (username) {
            navigate('/account/main');
        } else {
            navigate("/account/signup");
        }
    }

    const handleProfileClick = () => {
        setShowOptions(!showOptions);
    };
    async function HandleFaq(e) {
        const faq = e.currentTarget; // Get the clicked FAQ element
        faq.classList.toggle("active");
        const icon = faq.querySelector(".fa-solid");
        if (icon) {
            icon.classList.toggle("fa-chevron-right");
            icon.classList.toggle("fa-chevron-down");
        }
    }


    async function handleLogout() {
        alert("HandleLogout");
        try {
            const response = await fetch("http://localhost:8001/user/logout", {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();
            if (response.status === 200) {
                alert("Logout successful");
                window.location.href = "http://localhost:3000/";
            } else {
                alert(result.error || "Logout failed.");
            }
        } catch (error) {
            console.error("Logout failed:", error);
            alert("An error occurred. Please try again.");
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:8001/user/main", {
                    method: "POST",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Unauthorized access");
                }
                const data = await response.json();
                setUsername(data.username);
            } catch (error) {
                console.error("Failed to fetch main page data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <nav className="pt-3 navbar navbar-expand-lg navbar-light navbar_shadow position-fixed">
                <div className="container-fluid">
                    <a className="text-white navbar-brand" href="index.html">
                        Jewellery Creator
                    </a>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-toggle="collapse"
                        data-target="#navbarNavAltMarkup"
                        aria-controls="navbarNavAltMarkup"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                        <div className="navbar-nav m-auto">
                            <Link to="homeSection" smooth={true} duration={500} className="text-white nav-link navItem_lg">Home</Link>
                            <Link to="KeyFeatures" smooth={true} duration={500} className="text-white nav-link navItem_lg">Key Features</Link>
                            <Link to="HowItWorks" smooth={true} duration={500} className="text-white nav-link navItem_lg">About Us</Link>

                        </div>
                       
                        {username ? (
                            <div>
                                <div className="profile" onClick={handleProfileClick}>{username[0].toUpperCase()}</div>
                                {showOptions && (
                                    <div className="dropdown">
                                        <button className="drop-btn">Gallery</button>
                                        <button className="logoutButton drop-btn" onClick={handleLogout}>Logout</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button id="login_signup_button_lg" onClick={loginRedirect} title="Login">Login</button>
                        )}
                    </div>
                </div>
            </nav>
            <div className="home" id="homeSection">
                <div className="container-fluid">
                    <div className="column">
                        <div className="row">
                            <div className="home_page_elements col-7">
                                {/* Vertical sine wave line before the heading */}
                                <div className="sine-wave-line" />
                                <h1>
                                    Elevate Your
                                    <br />
                                    jewellery
                                    <br /> Experience
                                </h1>
                                <p>
                                    Discover the art of jewellery design enhanced by cutting-edge GAN
                                    <br /> technology, transforming low-quality images into stunning,
                                    high-resolution
                                    <br /> masterpieces.
                                </p>
                                <button className="Get_Started mt-3 shadow" onClick={signUpRedirect}>Get Started</button>

                            </div>
                            <div className="col-5">
                                <img
                                    className="w-75 img-fluid home_page_pic"
                                    src={Home_page_pic}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="KeyFeatures" className="offset-section">
                <div className="conatiner" style={{ marginLeft: 20 }}>
                    <div className="column">
                        <div className="row" style={{ width: "100%" }}>
                            <div className="key_features_container_headings col-12">
                                <h1 className="text-center pb-3">Key Features</h1>
                                <h1 className="key_features_head text-center pb-3">
                                    Innovate your Design
                                </h1>
                                <p className="text-center">
                                    Enhance your jewellery designs effortlessly. Our tool uses Deep
                                    Learning technology to create
                                    <br />
                                    high-quality visuals that capture the essence of luxury.
                                </p>
                            </div>
                            <div className="col-12 d-flex flex-row justify-content-center">
                                <div className="key_features_container_1">
                                    <i className="fa-solid fa-robot mb-4 icon_1" />
                                    <h1>Creative Design Generation</h1>
                                    <p>
                                        Generate unique and realistic
                                        <br />
                                        jewellery designs based on your
                                        <br />
                                        sketches, ensuring each piece
                                        <br />
                                        is one-of-a-kind
                                    </p>
                                </div>
                                <div className="key_features_container_2">
                                    <i className="fa-solid fa-handshake-simple mb-4 icon_2" />
                                    <h1>User-Friendly Interface</h1>
                                    <p>
                                        Navigate through our sleek and
                                        <br />
                                        modern interface designed for ease
                                        <br />
                                        of use, making your design
                                        <br />
                                        process enjoyable.
                                    </p>
                                </div>
                                <div className="key_features_container_3">
                                    <i className="fa-solid fa-star mb-4 icon_3" />
                                    <h1>Seamless Integration</h1>
                                    <p>
                                        Easily integrate your designs into
                                        <br />
                                        your existing workflow, allowing for a<br />
                                        smooth transition from concept to
                                        <br />
                                        creation
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="HowItWorks">
                <div className="conatiner" style={{ marginLeft: 20 }}>
                    <div className="column">
                        <div className="row" style={{ width: "100%" }}>
                            <div className="col-12 How_it_works_container">
                                <h1>How It Works</h1>
                                <div className="mt-5 d-flex flex-row justify-content-start">
                                    <div
                                        style={{ marginRight: 100 }}
                                        className="How_it_works_container_elements_1"
                                    >
                                        <i className="fa-solid fa-cloud-arrow-up mb-3" />
                                        <h1>Step 1: Upload Image</h1>
                                        <p>
                                            Easily upload your low-quality jewellery images for
                                            <br />
                                            enhancement
                                        </p>
                                    </div>
                                    <div
                                        style={{ marginRight: 100 }}
                                        className="How_it_works_container_elements_2"
                                    >
                                        <i className="fa-solid fa-arrows-rotate mb-3" />
                                        <h1>Step 2: Generative Designs</h1>
                                        <p>
                                            Watch as our GAN technology crafts stunning
                                            <br />
                                            designs in real-time
                                        </p>
                                    </div>
                                    <div
                                        style={{ marginRight: 100 }}
                                        className="How_it_works_container_elements_3"
                                    >
                                        <i className="fa-solid fa-cloud-arrow-down mb-3" />
                                        <h1>Step 3: Customize &amp; Order</h1>
                                        <p>
                                            Personalize your favourite designs and place your
                                            <br />
                                            order effortlessly
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="FAQs" className="mt-5 w-100">
                <div style={{ marginLeft: 130 }}>
                    <div className="column">
                        <div className="row" style={{ width: "100%" }}>
                            <div className="col-12">
                                <h2 className="faq_heading">FAQs</h2>
                            </div>
                            <div className="col-12">
                                <div className="faqs mt-5 mr-5 mb-3 pb-2" onClick={HandleFaq}>
                                    <div className="question">
                                        <h1>Is the colorization done in real-time?</h1>
                                        <i className="fa-solid fa-chevron-right" />
                                    </div>
                                    <div className="answer">
                                        <p>
                                            The process is near real-time for standard images. However,
                                            very high-resolution images or complex transformations may
                                            take a bit longer.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="faqs mt-3 mr-5 mb-3 pb-2" onClick={HandleFaq}>
                                    <div className="question">
                                        <h1>How can I get started with using this tool?</h1>
                                        <i className="fa-solid fa-chevron-right" />
                                    </div>
                                    <div className="answer">
                                        <p>
                                            To start colorizing your sketch images, simply upload your
                                            image file to our platform, and the deep learning model will
                                            automatically process and return a colorized version.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="faqs mt-3 mr-5 mb-3 pb-2" onClick={HandleFaq}>
                                    <div className="question">
                                        <h1>How accurate is the colorization process?</h1>
                                        <i className="fa-solid fa-chevron-right" />
                                    </div>
                                    <div className="answer">
                                        <p>
                                            The accuracy of the colorization depends on the quality and
                                            features of the sketch image. While the deep learning model
                                            provides realistic color outputs, minor adjustments may
                                            sometimes be needed for specific color tones. However, the
                                            results are typically impressive and visually appealing.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="faqs mt-3 mr-5 mb-3 pb-2" onClick={HandleFaq}>
                                    <div className="question">
                                        <h1>How do you ensure the privacy of the uploaded images?</h1>
                                        <i className="fa-solid fa-chevron-right" />
                                    </div>
                                    <div className="answer">
                                        <p>
                                            All uploaded images are processed securely, and we do not
                                            store or share any user data or images without consent. We
                                            take privacy very seriously and adhere to best practices in
                                            data protection.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="faqs mt-3 mr-5 mb-3 pb-2" onClick={HandleFaq}>
                                    <div className="question d-flex align-items-center">
                                        <h1>
                                            What technology do you use to colorize sketch images?
                                        </h1>
                                        <i className="fa-solid fa-chevron-right ml-2" />
                                    </div>
                                    <div className="answer">
                                        <p>
                                            We use advanced deep learning algorithms, particularly
                                            convolutional neural networks (CNNs), trained on large
                                            datasets of colored images. The models learn how to predict
                                            and generate realistic colors for black-and-white images.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <div id="ContactUs" style={{ margin: "200px 0 50px 0" }}>
                <div className="column">
                    <div className="row" style={{ width: "100%" }}>
                        <div className="col-6">
                            <img src="" alt="" />
                        </div>

                        <div className="text-center col-12 mb-3">
                            <h1 className="copy_rights">
                                <i className="fa-solid fa-copyright" />
                                2024 Jewel Vision. Pioneering Jewelry Design with Deep Learning.
                            </h1>
                        </div>
                        <div className="links text-center col-12">
                            <a className="mr-5" href="">
                                About Us
                            </a>
                            <a className="mr-5" href="">
                                Our Designs
                            </a>
                            <a className="mr-5" href="">
                                Privacy Policy
                            </a>
                            <a className="mr-5" href="">
                                Terms &amp; Conditions
                            </a>
                            <a className="mr-5" href="">
                                Contact Us
                            </a>
                            <span style={{ borderRight: "1px solid white", marginRight: 40 }} />
                            <a className="mr-3" href="#">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={13}
                                    height={13}
                                    fill="currentColor"
                                    className="bi bi-google"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                                </svg>
                            </a>
                            <a className="mr-3" href="#">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={13}
                                    height={13}
                                    fill="currentColor"
                                    className="bi bi-facebook"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
                                </svg>
                            </a>
                            <a className="mr-3" href="#">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={13}
                                    height={13}
                                    fill="currentColor"
                                    className="bi bi-twitter-x"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
}
