
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Linkedin, Youtube, ArrowRight, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import { AccessibilityMenu } from '@/components/ui/AccessibilityMenu';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="/lovable-uploads/17953c8a-6715-4e58-af68-a3918c44fd33.png" 
                  alt="Ishanya Foundation" 
                  className="h-10 w-auto" 
                />
                <span className="ml-2 text-xl font-bold text-ishanya-green">Sankalp Portal</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="#home" className="border-transparent text-gray-600 dark:text-gray-300 hover:text-ishanya-green dark:hover:text-ishanya-green hover:border-ishanya-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </a>
                <a href="#about" className="border-transparent text-gray-600 dark:text-gray-300 hover:text-ishanya-green dark:hover:text-ishanya-green hover:border-ishanya-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  About Us
                </a>
                <a href="#mission" className="border-transparent text-gray-600 dark:text-gray-300 hover:text-ishanya-green dark:hover:text-ishanya-green hover:border-ishanya-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Vision & Mission
                </a>
                <a href="#services" className="border-transparent text-gray-600 dark:text-gray-300 hover:text-ishanya-green dark:hover:text-ishanya-green hover:border-ishanya-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Services
                </a>
                <a href="#contact" className="border-transparent text-gray-600 dark:text-gray-300 hover:text-ishanya-green dark:hover:text-ishanya-green hover:border-ishanya-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Contact
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  <Facebook size={18} />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400"
                >
                  <Instagram size={18} />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-800 dark:text-gray-400 dark:hover:text-blue-500"
                >
                  <Linkedin size={18} />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                >
                  <Youtube size={18} />
                </a>
              </div>
              <AccessibilityMenu />
              <Button 
                onClick={goToLogin}
                className="bg-ishanya-green hover:bg-ishanya-green/90 text-white"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-r from-ishanya-green/10 to-ishanya-yellow/10 dark:from-ishanya-green/5 dark:to-ishanya-yellow/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                <span className="block text-ishanya-green">Sankalp Portal</span>
                <span className="block text-ishanya-yellow mt-1">Journey to Inclusion</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
                The Ishanya Foundation's comprehensive database management system for supporting individuals with special needs.
              </p>
              <div className="mt-8 flex">
                <div className="inline-flex rounded-md shadow">
                  <Button 
                    onClick={goToLogin}
                    className="bg-ishanya-green hover:bg-ishanya-green/90 text-white px-8 py-3 text-base font-medium"
                  >
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <div className="ml-3 inline-flex">
                  <a 
                    href="#about"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-ishanya-green bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-ishanya-green dark:hover:bg-gray-700"
                  >
                    Learn more
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:w-1/2 flex justify-center">
              <img 
                src="https://i.imgur.com/WVhwZr0.png" 
                alt="Inclusive Education Illustration" 
                className="max-h-96 animate-fade-in rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              About <span className="text-ishanya-green">Ishanya Foundation</span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              "ISHANYA" - Meaning "North-East," symbolizing Education, Knowledge, and Prosperity.
            </p>
          </div>
          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col justify-center">
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Founded in 2015, <strong>Ishanya India Foundation (IIF)</strong> supports individuals with special needs and aims to create a more inclusive society. We work with individuals with Autism Spectrum Disorder, Asperger's Syndrome, Learning Disabilities, Down Syndrome, ADHD, and other developmental conditions.
                </p>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Our approach uses a customized curriculum to cater to different needs and promotes holistic development, employment training, and independent living skills for all our beneficiaries.
                </p>
              </div>
              <div className="order-first md:order-last">
                <div className="rounded-lg overflow-hidden shadow-lg h-full">
                  <img 
                    src="https://i.imgur.com/4R5f6bB.png" 
                    alt="Ishanya Foundation Work" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section id="mission" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Our Vision & Mission
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-lg border-t-4 border-ishanya-green hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-ishanya-green mb-4">Vision</h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 italic">
                  "A society built on Diversity, Equity & Inclusion for Persons with Disabilities."
                </p>
                <div className="mt-6 flex justify-center">
                  <img 
                    src="https://i.imgur.com/nWFUwVF.png" 
                    alt="Vision Illustration" 
                    className="h-48 object-contain"
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-t-4 border-ishanya-yellow hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-ishanya-yellow mb-4">Mission</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <Heart className="h-5 w-5 text-ishanya-yellow mr-2 mt-1 flex-shrink-0" />
                    <span>Capacity building of stakeholders</span>
                  </li>
                  <li className="flex items-start">
                    <Heart className="h-5 w-5 text-ishanya-yellow mr-2 mt-1 flex-shrink-0" />
                    <span>Creating inclusive learning & development spaces</span>
                  </li>
                  <li className="flex items-start">
                    <Heart className="h-5 w-5 text-ishanya-yellow mr-2 mt-1 flex-shrink-0" />
                    <span>Person-centric approach for tailored solutions</span>
                  </li>
                  <li className="flex items-start">
                    <Heart className="h-5 w-5 text-ishanya-yellow mr-2 mt-1 flex-shrink-0" />
                    <span>Transitioning from beneficiaries to contributors</span>
                  </li>
                  <li className="flex items-start">
                    <Heart className="h-5 w-5 text-ishanya-yellow mr-2 mt-1 flex-shrink-0" />
                    <span>Promoting social, economic, and political inclusion</span>
                  </li>
                  <li className="flex items-start">
                    <Heart className="h-5 w-5 text-ishanya-yellow mr-2 mt-1 flex-shrink-0" />
                    <span>Encouraging independence and raising awareness</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Our Services
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Comprehensive solutions for individuals with special needs
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Education Programs",
                description: "Personalized learning programs tailored to individual capabilities and needs.",
                icon: "https://i.imgur.com/hN4qO9W.png"
              },
              {
                title: "Skill Development",
                description: "Training in vocational skills to enhance employability and independence.",
                icon: "https://i.imgur.com/tMROEtq.png"
              },
              {
                title: "Counseling Services",
                description: "Professional support for individuals and families navigating special needs.",
                icon: "https://i.imgur.com/iuubVSU.png"
              },
              {
                title: "Assistive Technology",
                description: "Access to tools and technologies that enhance learning and daily living.",
                icon: "https://i.imgur.com/O2DZ2PF.png"
              },
              {
                title: "Community Integration",
                description: "Programs designed to facilitate social inclusion and participation.",
                icon: "https://i.imgur.com/XVbPH2n.png"
              },
              {
                title: "Research & Awareness",
                description: "Ongoing studies and campaigns to promote understanding and acceptance.",
                icon: "https://i.imgur.com/Z7oRIik.png"
              }
            ].map((service, index) => (
              <Card 
                key={index}
                className="shadow hover:shadow-lg transition-shadow duration-300 hover:border-ishanya-green border-transparent border"
                onMouseEnter={() => setIsHovering(service.title)}
                onMouseLeave={() => setIsHovering(null)}
              >
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="w-20 h-20 flex items-center justify-center mb-4">
                    <img 
                      src={service.icon} 
                      alt={service.title} 
                      className={`w-16 h-16 object-contain transition-transform duration-300 ${isHovering === service.title ? 'scale-110' : ''}`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Contact Us
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Get in touch with our team
            </p>
          </div>
          <div className="mt-12 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 md:p-10">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reach Out to Us</h3>
                <div className="space-y-4">
                  <p className="flex items-start text-gray-600 dark:text-gray-300">
                    <svg className="h-6 w-6 text-ishanya-green mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>123 Education Street, Pune, Maharashtra, India</span>
                  </p>
                  <p className="flex items-start text-gray-600 dark:text-gray-300">
                    <svg className="h-6 w-6 text-ishanya-green mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>info@ishanyafoundation.org</span>
                  </p>
                  <p className="flex items-start text-gray-600 dark:text-gray-300">
                    <svg className="h-6 w-6 text-ishanya-green mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>+91 98765 43210</span>
                  </p>
                </div>
                <div className="mt-8 flex space-x-6">
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Facebook size={24} />
                  </a>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-800"
                  >
                    <Instagram size={24} />
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-900"
                  >
                    <Linkedin size={24} />
                  </a>
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-800"
                  >
                    <Youtube size={24} />
                  </a>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 md:p-10">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Location</h3>
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                  {/* Map placeholder */}
                  <div className="w-full h-full flex items-center justify-center">
                    <img 
                      src="https://i.imgur.com/5KrQAqB.png" 
                      alt="Map Location" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-ishanya-green py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-xl text-white/80">
              Join us in our mission to create a more inclusive society.
            </p>
            <div className="mt-8">
              <Button 
                onClick={goToLogin}
                className="bg-white text-ishanya-green hover:bg-gray-100 px-8 py-3 text-base font-medium rounded-md"
              >
                Login to Portal
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/17953c8a-6715-4e58-af68-a3918c44fd33.png" 
                  alt="Ishanya Foundation" 
                  className="h-10 w-auto"
                />
                <span className="ml-2 text-xl font-bold">Ishanya Foundation</span>
              </div>
              <p className="mt-4 text-gray-300">
                Creating a more inclusive society for individuals with special needs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-300 hover:text-white">Home</a></li>
                <li><a href="#about" className="text-gray-300 hover:text-white">About Us</a></li>
                <li><a href="#mission" className="text-gray-300 hover:text-white">Vision & Mission</a></li>
                <li><a href="#services" className="text-gray-300 hover:text-white">Services</a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  <Linkedin size={20} />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  <Youtube size={20} />
                </a>
              </div>
              <p className="mt-4 text-gray-300">
                Subscribe to our newsletter for updates.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2025 Ishanya India Foundation. All rights reserved.</p>
            <div className="mt-4 sm:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
