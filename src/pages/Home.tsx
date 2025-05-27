import { Link } from 'react-router-dom';
import '../App.css'; // Contains .page-container and other globalish styles

function Home() {
    return (
        // No single .page-container here, sections will manage their own width or use .container internally
        <>
            <section className="hero-section text-center">
                <div className="container hero-content">
                    <h1>Track Your Nutrition with <span className="app-name" style={{ color: 'var(--color-interactive-indigo)' }}>NutriSnap</span></h1>
                    <p className="text-muted" style={{ fontSize: '1.125rem', marginBottom: 'var(--spacing-large)' }}>Simply take a photo of your food and get instant nutritional analysis. Track your macros and stay on top of your health goals.</p>
                    <div className="cta-buttons" style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-medium)' }}>
                        <Link to="/upload" className="btn btn-primary btn-lg"><i className="fas fa-camera"></i> Analyze Food Now</Link>
                        <Link to="/auth" className="btn btn-secondary btn-lg">Get Started <i className="fas fa-arrow-right"></i></Link>
                    </div>
                </div>
            </section>

            <section className="how-it-works-section text-center">
                <div className="container">
                    <h2>How It Works</h2>
                    <p className="text-muted" style={{ fontSize: '1.125rem', marginBottom: 'var(--spacing-large)' }}>NutriSnap makes tracking your nutrition simple and accurate with our advanced food recognition technology.</p>
                    <div className="steps">
                        <div className="step app-card">
                            <div className="icon" style={{ fontSize: '2rem', color: 'var(--color-interactive-indigo)', marginBottom: 'var(--spacing-medium)' }}><i className="fas fa-camera"></i></div>
                            <h3>Snap a Photo</h3>
                            <p className="text-muted">Take a clear picture of your meal using your phone's camera.</p>
                        </div>
                        <div className="step app-card">
                            <div className="icon" style={{ fontSize: '2rem', color: 'var(--color-interactive-indigo)', marginBottom: 'var(--spacing-medium)' }}><i className="fas fa-utensils"></i></div>
                            <h3>Get Analysis</h3>
                            <p className="text-muted">Our AI analyzes the food and provides a detailed nutrient breakdown.</p>
                        </div>
                        <div className="step app-card">
                            <div className="icon" style={{ fontSize: '2rem', color: 'var(--color-interactive-indigo)', marginBottom: 'var(--spacing-medium)' }}><i className="fas fa-chart-bar"></i></div>
                            <h3>Track Progress</h3>
                            <p className="text-muted">Monitor your daily intake and progress towards your health goals.</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Home;
