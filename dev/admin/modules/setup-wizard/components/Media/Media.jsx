import { useState } from "@wordpress/element";

function Media() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <img
                src="https://img.youtube.com/vi/wytlIbQY4SY/maxresdefault.jpg"
                alt="Video Tutorial"
            />
            <div className="adminify-media-play">
                <button onClick={() => setIsOpen(true)}>
                    <svg
                        width="24"
                        height="31"
                        viewBox="0 0 24 31"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M-0.00195312 1.36852C-0.00195312 0.569821 0.888192 0.0934303 1.55275 0.536467L22.75 14.6679C23.3437 15.0638 23.3437 15.9362 22.75 16.332L1.55275 30.4635C0.888192 30.9066 -0.00195312 30.4302 -0.00195312 29.6315V1.36852Z"
                            fill="#F04438"
                        />
                    </svg>
                </button>
            </div>

            {isOpen ? (
                <>
                    <div className="adminify-video-popup-overlay" />

                    <div className="adminify-video-popup-close" onClick={() => setIsOpen(false)}>
                        &#10005;
                    </div>

                    <div className="adminify-video-popup-container">
                        <div className="adminify-video-popup-iframe-container">
                            <iframe
                                width="100%"
                                height="100%"
                                className="adminify-video-popup-iframe"
                                src="https://www.youtube.com/embed/wytlIbQY4SY?si=X85KvjDB5jD4dF4z"
                                title="YouTube video player"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerpolicy="strict-origin-when-cross-origin"
                                allowfullscreen
                            />
                        </div>
                    </div>
                </>
            ) : null}
        </>
    );
}

export default Media;
