import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, ArrowRight, Heart, Mail, MapPin, Phone, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AccessibilityMenu } from '@/components/ui/AccessibilityMenu';
import { DyslexiaToggle } from '@/components/ui/DyslexiaToggle';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // For debugging - log current language
  useEffect(() => {
    console.log("Current language:", language);
  }, [language]);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add smooth scrolling behavior
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.hash && anchor.hash.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(anchor.hash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          // Close mobile menu if open
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const goToLogin = () => {
    navigate('/login');
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2
      }
    }
  };

  const pulseAnimation = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.02, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Navbar */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <a href="#home">
                  <img 
                    src="/lovable-uploads/a6017f5f-7947-49ad-a9ed-0bc0e588a9b0.png" 
                    alt="Ishanya Logo" 
                    className="h-14 w-auto" 
                  />
                </a>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a href="#home" className="border-transparent text-gray-600 dark:text-gray-300 hover:text-ishanya-green dark:hover:text-ishanya-green hover:border-ishanya-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {t('common.home') || 'Home'}
                </a>
                <a href="#about" className="border-transparent text-gray-600 dark:text-gray-300 hover:text-ishanya-green dark:hover:text-ishanya-green hover:border-ishanya-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {t('common.about') || 'About Us'}
                </a>
                <a href="#mission" className="border-transparent text-gray-600 dark:text-gray-300 hover:text-ishanya-green dark:hover:text-ishanya-green hover:border-ishanya-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {t('common.vision_mission') || 'Vision & Mission'}
                </a>
                <a href="#services" className="border-transparent text-gray-600 dark:text-gray-300 hover:text-ishanya-green dark:hover:text-ishanya-green hover:border-ishanya-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {t('common.services') || 'Services'}
                </a>
                <a href="#contact" className="border-transparent text-gray-600 dark:text-gray-300 hover:text-ishanya-green dark:hover:text-ishanya-green hover:border-ishanya-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {t('common.contact') || 'Contact'}
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <a 
                  href="https://www.facebook.com/ishanyaindia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  <Facebook size={18} />
                </a>
                <a 
                  href="https://x.com/ishanyaindia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  <Twitter size={18} />
                </a>
                <a 
                  href="https://www.instagram.com/ishanyaindia/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 transition-colors duration-300"
                >
                  <Instagram size={18} />
                </a>
                <a 
                  href="https://www.linkedin.com/company/ishanyaindia/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-800 dark:text-gray-400 dark:hover:text-blue-500 transition-colors duration-300"
                >
                  <Linkedin size={18} />
                </a>
                <a 
                  href="https://www.youtube.com/channel/UC1bQFruy88Y8DrgXt4oq3og" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors duration-300"
                >
                  <Youtube size={18} />
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <AccessibilityMenu />
                <DyslexiaToggle />
              </div>
              <Button 
                onClick={goToLogin}
                className="bg-ishanya-green hover:bg-ishanya-green/90 text-white"
              >
                {t('login.button') || 'Login'}
              </Button>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <div className="space-y-1.5 block h-6 w-6 p-1">
                    <span className="block w-full h-0.5 bg-current"></span>
                    <span className="block w-full h-0.5 bg-current"></span>
                    <span className="block w-full h-0.5 bg-current"></span>
                  </div>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <a href="#home" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                {t('common.home') || 'Home'}
              </a>
              <a href="#about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                {t('common.about') || 'About Us'}
              </a>
              <a href="#mission" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                {t('common.vision_mission') || 'Vision & Mission'}
              </a>
              <a href="#services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                {t('common.services') || 'Services'}
              </a>
              <a href="#contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                {t('common.contact') || 'Contact'}
              </a>
              <div className="flex space-x-4 px-3 py-2">
                <a href="https://www.facebook.com/ishanyaindia" target="_blank" rel="noopener noreferrer">
                  <Facebook size={20} className="text-gray-500 hover:text-blue-600" />
                </a>
                <a href="https://x.com/ishanyaindia" target="_blank" rel="noopener noreferrer">
                  <Twitter size={20} className="text-gray-500 hover:text-blue-500" />
                </a>
                <a href="https://www.instagram.com/ishanyaindia/" target="_blank" rel="noopener noreferrer">
                  <Instagram size={20} className="text-gray-500 hover:text-pink-600" />
                </a>
                <a href="https://www.linkedin.com/company/ishanyaindia/" target="_blank" rel="noopener noreferrer">
                  <Linkedin size={20} className="text-gray-500 hover:text-blue-800" />
                </a>
                <a href="https://www.youtube.com/channel/UC1bQFruy88Y8DrgXt4oq3og" target="_blank" rel="noopener noreferrer">
                  <Youtube size={20} className="text-gray-500 hover:text-red-600" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-24 pb-20 md:pt-32 md:pb-28 bg-gradient-to-r from-ishanya-green/10 via-white/10 to-ishanya-yellow/10 dark:from-ishanya-green/5 dark:to-ishanya-yellow/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <motion.div 
              className="lg:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                <span className="block text-ishanya-green pr-4">{t('landing.hero_title') || 'Ishanya Portal'}</span>
                <span className="block text-ishanya-yellow mt-1">{t('landing.hero_subtitle') || 'Journey to Inclusion'}</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
                {t('landing.hero_description') || 'The Ishanya Foundation\'s comprehensive database management system for supporting individuals with special needs.'}
              </p>
              <motion.div 
                className="mt-8 flex flex-wrap gap-4"
                variants={staggerChildren}
              >
                <motion.div variants={fadeIn}>
                  <Button 
                    onClick={goToLogin}
                    className="bg-ishanya-green hover:bg-ishanya-green/90 text-white px-5 py-2 text-base font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    size="default"
                  >
                    {t('login.button') || 'Login'} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div variants={fadeIn}>
                  <a 
                    href="#about"
                    className="inline-flex items-center justify-center px-5 py-2 text-base font-medium rounded-lg bg-white text-ishanya-green hover:bg-gray-50 dark:bg-gray-800 dark:text-ishanya-green dark:hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 border border-transparent"
                  >
                    {t('common.learn_more') || 'Learn more'} <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div 
              className="mt-10 lg:mt-0 lg:w-1/2 flex justify-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src="/lovable-uploads/1260dc9c-0b71-497d-a3b2-7dd2ec28d34f.png"
                alt="Children with special needs" 
                className="max-h-96 rounded-2xl shadow-2xl object-cover"
              />
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white dark:to-gray-800"></div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white dark:bg-gray-800 relative">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-ishanya-green/5 to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-ishanya-yellow/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              {t('common.about') || 'About'} <span className="text-ishanya-green">{t('landing.foundation_name') || 'Ishanya Foundation'}</span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              {t('landing.meaning') || '"ISHANYA" - Meaning "North-East," symbolizing Education, Knowledge, and Prosperity.'}
            </p>
          </motion.div>
          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div 
                className="flex flex-col justify-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t('landing.about_p1') || 'Founded in 2015, '}<strong className="text-ishanya-green">{t('landing.foundation_full_name') || 'Ishanya India Foundation (IIF)'}</strong>{t('landing.about_p1_cont') || ' supports individuals with special needs and aims to create a more inclusive society. We work with individuals with Autism Spectrum Disorder, Asperger\'s Syndrome, Learning Disabilities, Down Syndrome, ADHD, and other developmental conditions.'}
                </p>
                <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t('landing.about_p2') || 'Our approach uses a customized curriculum to cater to different needs and promotes holistic development, employment training, and independent living skills for all our beneficiaries.'}
                </p>
                <div className="mt-8 flex justify-center space-x-8">
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="bg-ishanya-green/20 p-2 rounded-full">
                      <Heart className="h-5 w-5 text-ishanya-green" />
                    </div>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">{t('landing.inclusive_education') || 'Inclusive Education'}</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="bg-ishanya-yellow/20 p-2 rounded-full">
                      <Heart className="h-5 w-5 text-ishanya-yellow" />
                    </div>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">{t('landing.supportive_community') || 'Supportive Community'}</span>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Replace the image with the new image */}
              <motion.div
                className="flex justify-center items-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <img 
                  src="/lovable-uploads/903e9b92-3113-4ad9-aa06-7650ccfbcd20.png"
                  alt="Inclusion and accessibility illustration showing hands supporting people with disabilities" 
                  className="rounded-2xl shadow-xl object-cover h-80 w-full" 
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section id="mission" className="py-20 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              {t('landing.vision_mission_title') || 'Our Vision & Mission'}
            </h2>
            <div className="mt-4 w-24 h-1 bg-ishanya-green mx-auto rounded-full"></div>
          </motion.div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="shadow-xl border-t-4 border-ishanya-green hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden h-full bg-white dark:bg-gray-800">
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="flex items-center mb-6">
                    <div className="h-12 w-12 rounded-full bg-ishanya-green/20 flex items-center justify-center">
                      <svg className="h-6 w-6 text-ishanya-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12h5l2 3h6l2-3h5"></path>
                        <circle cx="12" cy="8" r="2"></circle>
                        <path d="M12 10v4"></path>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-ishanya-green ml-4">{t('landing.vision') || 'Vision'}</h3>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-300 italic border-l-4 border-ishanya-green pl-4 py-2">
                    {t('landing.vision_text') || '"A society built on Diversity, Equity & Inclusion for Persons with Disabilities."'}
                  </p>
                  <div className="mt-8 flex justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1531379410502-63bfe8cdaf6f?q=80&w=2787&auto=format&fit=crop"
                      alt="Vision Illustration" 
                      className="h-48 object-cover rounded-xl shadow-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="shadow-xl border-t-4 border-ishanya-yellow hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden h-full bg-white dark:bg-gray-800">
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="flex items-center mb-6">
                    <div className="h-12 w-12 rounded-full bg-ishanya-yellow/20 flex items-center justify-center">
                      <svg className="h-6 w-6 text-ishanya-yellow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22v-5"></path>
                        <path d="M9 8V2"></path>
                        <path d="M15 8V2"></path>
                        <path d="M12 8a4 4 0 0 0-4 4v2h8v-2a4 4 0 0 0-4-4Z"></path>
                        <path d="M4 17h16"></path>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-ishanya-yellow ml-4">{t('landing.mission') || 'Mission'}</h3>
                  </div>
                  <ul className="space-y-4 text-gray-600 dark:text-gray-300">
                    {[
                      t('landing.mission_1') || "Capacity building of stakeholders",
                      t('landing.mission_2') || "Creating inclusive learning & development spaces",
                      t('landing.mission_3') || "Person-centric approach for tailored solutions",
                      t('landing.mission_4') || "Transitioning from beneficiaries to contributors",
                      t('landing.mission_5') || "Promoting social, economic, and political inclusion",
                      t('landing.mission_6') || "Encouraging independence and raising awareness"
                    ].map((item, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-start bg-ishanya-yellow/5 p-3 rounded-lg hover:bg-ishanya-yellow/10 transition-colors duration-300"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Heart className="h-5 w-5 text-ishanya-yellow mr-3 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Our Services
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive solutions for individuals with special needs
            </p>
            <div className="mt-4 w-24 h-1 bg-ishanya-green mx-auto rounded-full"></div>
          </motion.div>
          <motion.div 
            className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                title: "Education Programs",
                description: "Personalized learning programs tailored to individual capabilities and needs.",
                icon: "https://img.icons8.com/fluency/96/000000/book.png"
              },
              {
                title: "Skill Development",
                description: "Training in vocational skills to enhance employability and independence.",
                icon: "https://img.icons8.com/fluency/96/000000/development-skill.png"
              },
              {
                title: "Counseling Services",
                description: "Professional support for individuals and families navigating special needs.",
                icon: "https://img.icons8.com/fluency/96/000000/conference-call.png"
              },
              {
                title: "Assistive Technology",
                description: "Access to tools and technologies that enhance learning and daily living.",
                icon: "https://img.icons8.com/fluency/96/000000/technology-items.png"
              },
              {
                title: "Community Integration",
                description: "Programs designed to facilitate social inclusion and participation.",
                icon: "https://img.icons8.com/fluency/96/000000/conference.png"
              },
              {
                title: "Research & Awareness",
                description: "Ongoing studies and campaigns to promote understanding and acceptance.",
                icon: "https://img.icons8.com/fluency/96/000000/microscope.png"
              }
            ].map((service, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <Card 
                  className={`shadow-lg hover:shadow-2xl transition-all duration-500 h-full overflow-hidden border-none bg-gradient-to-br ${index % 2 === 0 ? 'from-ishanya-green/5 to-white' : 'from-ishanya-yellow/5 to-white'} dark:from-gray-700 dark:to-gray-800 rounded-2xl`}
                  onMouseEnter={() => setIsHovering(service.title)}
                  onMouseLeave={() => setIsHovering(null)}
                >
                  <CardContent className="p-8 flex flex-col items-center h-full">
                    <div className="w-20 h-20 flex items-center justify-center mb-6 bg-white dark:bg-gray-700 rounded-full shadow-md">
                      <img 
                        src={service.icon} 
                        alt={service.title} 
                        className={`w-12 h-12 object-contain transition-transform duration-300 ${isHovering === service.title ? 'scale-110' : ''}`}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-center flex-grow">{service.description}</p>
                    <div className={`w-12 h-1 mt-6 rounded-full ${index % 2 === 0 ? 'bg-ishanya-green' : 'bg-ishanya-yellow'}`}></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-850 relative">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent dark:from-gray-800"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              {t('common.contact') || 'Contact Us'}
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              {t('landing.contact_subtitle') || 'Get in touch with our team'}
            </p>
            <div className="mt-4 w-24 h-1 bg-ishanya-green mx-auto rounded-full"></div>
          </motion.div>
          <motion.div 
            className="mt-16 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col items-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">{t('landing.reach_out') || 'Reach Out to Us'}</h3>
                <div className="space-y-6 w-full max-w-md">
                  <div className="flex flex-col items-center">
                    <div className="flex-shrink-0 bg-ishanya-green/10 p-3 rounded-full mb-3">
                      <MapPin className="h-6 w-6 text-ishanya-green" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{t('landing.address') || 'Address'}</h4>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">769, 7th Main Rd, KSRTC Layout, 2nd Phase, JP Nagar, Bengaluru, Karnataka 560078</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex-shrink-0 bg-ishanya-green/10 p-3 rounded-full mb-3">
                      <Mail className="h-6 w-6 text-ishanya-green" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{t('landing.email') || 'Email'}</h4>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">info@ishanyafoundation.org</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex-shrink-0 bg-ishanya-green/10 p-3 rounded-full mb-3">
                      <Phone className="h-6 w-6 text-ishanya-green" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{t('landing.phone') || 'Phone'}</h4>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">+91 73496 76668</p>
                    </div>
                  </div>
                </div>
                <div className="mt-10 text-center">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('landing.follow_us') || 'Follow Us'}</h4>
                  <div className="flex justify-center space-x-6">
                    <a 
                      href="https://www.facebook.com/ishanyaindia" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-300"
                    >
                      <Facebook size={24} />
                    </a>
                    <a 
                      href="https://x.com/ishanyaindia" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-100 dark:bg-gray-800/30 p-3 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800/50 transition-colors duration-300"
                    >
                      <Twitter size={24} />
                    </a>
                    <a 
                      href="https://www.instagram.com/ishanyaindia/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-full text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors duration-300"
                    >
                      <Instagram size={24} />
                    </a>
                    <a 
                      href="https://www.linkedin.com/company/ishanyaindia/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-300"
                    >
                      <Linkedin size={24} />
                    </a>
                    <a 
                      href="https://www.youtube.com/channel/UC1bQFruy88Y8DrgXt4oq3og" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-300"
                    >
                      <Youtube size={24} />
                    </a>
                  </div>
                </div>
              </div>
              <div className="h-96 md:h-auto">
                <iframe
                  title="Ishanya Foundation Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.8291880953213!2d77.57743631482177!3d12.920053790887454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15081cb9f08d%3A0xe5a7a16a9cb93b9a!2s769%2C%207th%20Main%20Rd%2C%20KSRTC%20Layout%2C%20J.%20P.%20Nagar%20Phase%2C%20J.%20P.%20Nagar%2C%20Bengaluru%2C%20Karnataka%20560078!5e0!3m2!1sen!2sin!4v1651234567890!5m2!1sen!2sin"
                  className="w-full h-full border-0"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-ishanya-green to-ishanya-green/90 dark:from-ishanya-green/90 dark:to-ishanya-green/80 py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-xl text-white/90 max-w-2xl mx-auto">
              Join us in our mission to create a more inclusive society.
            </p>
            <motion.div 
              className="mt-10"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <Button 
                onClick={goToLogin}
                className="bg-white text-ishanya-green hover:bg-gray-100 px-6 py-2 text-lg font-medium rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                size="lg"
              >
                Login to Portal
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/a6017f5f-7947-49ad-a9ed-0bc0e588a9b0.png" 
                  alt="Ishanya Logo" 
                  className="h-16 w-auto"
                />
              </div>
              <p className="mt-4 text-gray-300 text-center md:text-left">
                {t('landing.foundation_tagline') || 'Creating a more inclusive society for individuals with special needs.'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6 border-b border-gray-700 pb-2 text-center md:text-left">{t('landing.quick_links') || 'Quick Links'}</h3>
              <ul className="space-y-3 flex flex-col items-center md:items-start">
                {[
                  { label: t('common.home') || 'Home', href: "#home" },
                  { label: t('common.about') || 'About Us', href: "#about" },
                  { label: t('common.vision_mission') || 'Vision & Mission', href: "#mission" },
                  { label: t('common.services') || 'Services', href: "#services" },
                  { label: t('common.contact') || 'Contact', href: "#contact" }
                ].map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2023-{new Date().getFullYear()} Ishanya Portal. All rights reserved.</p>
            <div className="mt-4 sm:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">{t('landing.privacy_policy') || 'Privacy Policy'}</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">{t('landing.terms') || 'Terms of Service'}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
