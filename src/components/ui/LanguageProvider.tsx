
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available languages
export type Language = 'english' | 'hindi' | 'kannada';

// Create context
type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string | undefined;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define translated strings for each language
const translations: Record<Language, Record<string, string>> = {
  english: {
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.administrator': 'Administrator',
    'common.hr': 'HR',
    'common.teacher': 'Teacher',
    'common.parent': 'Parent',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.theme.dark': 'Dark',
    'common.theme.light': 'Light',
    'common.theme.title': 'Theme',
    'common.language': 'Language',
    'common.english': 'English',
    'common.hindi': 'Hindi',
    'common.kannada': 'Kannada',
    'common.enable': 'Enable',
    'common.disable': 'Disable',
    'common.dyslexia': 'Dyslexia Mode',
    'common.home': 'Home',
    'common.about': 'About Us',
    'common.vision_mission': 'Vision & Mission',
    'common.services': 'Services',
    'common.contact': 'Contact',
    'common.learn_more': 'Learn more',
    
    'login.title': 'Login to Your Account',
    'login.subtitle': 'Enter your credentials to access your account',
    'login.email': 'Email address',
    'login.password': 'Password',
    'login.role': 'Select Role',
    'login.button': 'Login',
    'login.error': 'Invalid email or password',
    'login.logout_success': 'Logged out successfully',
    
    'accessibility.title': 'Accessibility',
    'accessibility.theme': 'Theme',
    'accessibility.language': 'Language',
    'accessibility.dyslexia': 'Dyslexia Friendly',
    'accessibility.theme_changed': 'Theme changed to',
    'accessibility.language_changed': 'Language changed to',
    'accessibility.dyslexia_enabled': 'Dyslexia-friendly mode enabled',
    'accessibility.dyslexia_disabled': 'Dyslexia-friendly mode disabled',
    
    'dashboard.notifications': 'Notifications',
    
    'chatbot.title': 'Assistant',
    'chatbot.placeholder': 'Type your question...',
    'chatbot.toggle': 'Toggle chatbot',
    'chatbot.close': 'Close',
    'chatbot.welcome': 'Hello! I can help you access information about students, programs, and more. What would you like to know?',
    'chatbot.error': 'Sorry, there was an error processing your request. Please try again.',
    'chatbot.no_results': 'No results found for your query.',
    
    // Landing page translations
    'landing.hero_title': 'Sankalp Portal',
    'landing.hero_subtitle': 'Journey to Inclusion',
    'landing.hero_description': 'The Ishanya Foundation\'s comprehensive database management system for supporting individuals with special needs.',
    'landing.foundation_name': 'Ishanya Foundation',
    'landing.foundation_full_name': 'Ishanya India Foundation (IIF)',
    'landing.meaning': '"ISHANYA" - Meaning "North-East," symbolizing Education, Knowledge, and Prosperity.',
    'landing.about_p1': 'Founded in 2015, ',
    'landing.about_p1_cont': ' supports individuals with special needs and aims to create a more inclusive society. We work with individuals with Autism Spectrum Disorder, Asperger\'s Syndrome, Learning Disabilities, Down Syndrome, ADHD, and other developmental conditions.',
    'landing.about_p2': 'Our approach uses a customized curriculum to cater to different needs and promotes holistic development, employment training, and independent living skills for all our beneficiaries.',
    'landing.inclusive_education': 'Inclusive Education',
    'landing.supportive_community': 'Supportive Community',
    'landing.vision_mission_title': 'Our Vision & Mission',
    'landing.vision': 'Vision',
    'landing.mission': 'Mission',
    'landing.vision_text': '"A society built on Diversity, Equity & Inclusion for Persons with Disabilities."',
    'landing.mission_1': 'Capacity building of stakeholders',
    'landing.mission_2': 'Creating inclusive learning & development spaces',
    'landing.mission_3': 'Person-centric approach for tailored solutions',
    'landing.mission_4': 'Transitioning from beneficiaries to contributors',
    'landing.mission_5': 'Promoting social, economic, and political inclusion',
    'landing.mission_6': 'Encouraging independence and raising awareness',
    'landing.contact_subtitle': 'Get in touch with our team',
    'landing.reach_out': 'Reach Out to Us',
    'landing.address': 'Address',
    'landing.email': 'Email',
    'landing.phone': 'Phone',
    'landing.follow_us': 'Follow Us',
    'landing.foundation_tagline': 'Creating a more inclusive society for individuals with special needs.',
    'landing.quick_links': 'Quick Links',
    'landing.newsletter': 'Newsletter',
    'landing.newsletter_description': 'Subscribe to our newsletter for the latest updates and news.',
    'landing.email_placeholder': 'Your email address',
    'landing.subscribe': 'Subscribe',
    'landing.privacy_policy': 'Privacy Policy',
    'landing.terms': 'Terms of Service',
  },
  hindi: {
    'common.back': 'वापस',
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.submit': 'जमा करें',
    'common.administrator': 'प्रशासक',
    'common.hr': 'मानव संसाधन',
    'common.teacher': 'शिक्षक',
    'common.parent': 'अभिभावक',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.theme.dark': 'डार्क',
    'common.theme.light': 'लाइट',
    'common.theme.title': 'थीम',
    'common.language': 'भाषा',
    'common.english': 'अंग्रेजी',
    'common.hindi': 'हिंदी',
    'common.kannada': 'कन्नड़',
    'common.enable': 'सक्षम करें',
    'common.disable': 'अक्षम करें',
    'common.dyslexia': 'डिस्लेक्सिया मोड',
    'common.home': 'होम',
    'common.about': 'हमारे बारे में',
    'common.vision_mission': 'दृष्टि और मिशन',
    'common.services': 'सेवाएं',
    'common.contact': 'संपर्क',
    'common.learn_more': 'अधिक जानें',
    
    'login.title': 'अपने खाते में लॉगिन करें',
    'login.subtitle': 'अपने खाते तक पहुंचने के लिए अपना प्रमाण पत्र दर्ज करें',
    'login.email': 'ईमेल पता',
    'login.password': 'पासवर्ड',
    'login.role': 'भूमिका चुनें',
    'login.button': 'लॉगिन',
    'login.error': 'अमान्य ईमेल या पासवर्ड',
    'login.logout_success': 'सफलतापूर्वक लॉगआउट किया गया',
    
    'accessibility.title': 'पहुंच',
    'accessibility.theme': 'थीम',
    'accessibility.language': 'भाषा',
    'accessibility.dyslexia': 'डिस्लेक्सिया अनुकूल',
    'accessibility.theme_changed': 'थीम बदलकर हो गई',
    'accessibility.language_changed': 'भाषा बदल गई',
    'accessibility.dyslexia_enabled': 'डिस्लेक्सिया-अनुकूल मोड सक्षम',
    'accessibility.dyslexia_disabled': 'डिस्लेक्सिया-अनुकूल मोड अक्षम',
    
    'dashboard.notifications': 'सूचनाएं',
    
    'chatbot.title': 'सहायक',
    'chatbot.placeholder': 'अपना प्रश्न लिखें...',
    'chatbot.toggle': 'चैटबॉट टॉगल करें',
    'chatbot.close': 'बंद करें',
    'chatbot.welcome': 'नमस्ते! मैं छात्रों, कार्यक्रमों और अधिक के बारे में जानकारी प्राप्त करने में आपकी मदद कर सकता हूं। आप क्या जानना चाहेंगे?',
    'chatbot.error': 'क्षमा करें, आपके अनुरोध को संसाधित करने में एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
    'chatbot.no_results': 'आपकी क्वेरी के लिए कोई परिणाम नहीं मिला।',
    
    // Landing page translations
    'landing.hero_title': 'संकल्प पोर्टल',
    'landing.hero_subtitle': 'समावेश की यात्रा',
    'landing.hero_description': 'विशेष आवश्यकताओं वाले व्यक्तियों को सहायता प्रदान करने के लिए इशान्या फाउंडेशन का व्यापक डेटाबेस प्रबंधन सिस्टम।',
    'landing.foundation_name': 'इशान्या फाउंडेशन',
    'landing.foundation_full_name': 'इशान्या इंडिया फाउंडेशन (IIF)',
    'landing.meaning': '"इशान्य" - अर्थ "उत्तर-पूर्व", शिक्षा, ज्ञान और समृद्धि का प्रतीक।',
    'landing.about_p1': '2015 में स्थापित, ',
    'landing.about_p1_cont': ' विशेष आवश्यकताओं वाले व्यक्तियों का समर्थन करता है और एक अधिक समावेशी समाज बनाने का लक्ष्य रखता है। हम ऑटिज्म स्पेक्ट्रम डिसऑर्डर, एस्पर्जर सिंड्रोम, लर्निंग डिसेबिलिटीज, डाउन सिंड्रोम, ADHD और अन्य विकासात्मक स्थितियों वाले व्यक्तियों के साथ काम करते हैं।',
    'landing.about_p2': 'हमारा दृष्टिकोण विभिन्न जरूरतों को पूरा करने के लिए एक अनुकूलित पाठ्यक्रम का उपयोग करता है और हमारे सभी लाभार्थियों के लिए समग्र विकास, रोजगार प्रशिक्षण और स्वतंत्र जीवन कौशल को बढ़ावा देता है।',
    'landing.inclusive_education': 'समावेशी शिक्षा',
    'landing.supportive_community': 'सहायक समुदाय',
    'landing.vision_mission_title': 'हमारी दृष्टि और मिशन',
    'landing.vision': 'दृष्टि',
    'landing.mission': 'मिशन',
    'landing.vision_text': '"विकलांग व्यक्तियों के लिए विविधता, समानता और समावेश पर आधारित एक समाज।"',
    'landing.mission_1': 'हितधारकों का क्षमता निर्माण',
    'landing.mission_2': 'समावेशी शिक्षण और विकास स्थान बनाना',
    'landing.mission_3': 'अनुकूलित समाधानों के लिए व्यक्ति-केंद्रित दृष्टिकोण',
    'landing.mission_4': 'लाभार्थियों से योगदानकर्ताओं में परिवर्तन',
    'landing.mission_5': 'विकलांग व्यक्तियों के लिए सामाजिक, आर्थिक और राजनीतिक समावेश को बढ़ावा देना',
    'landing.mission_6': 'स्वतंत्रता को प्रोत्साहित करना और एक समावेशी समाज के लिए जागरूकता बढ़ाना',
    'landing.contact_subtitle': 'हमारी टीम से संपर्क करें',
    'landing.reach_out': 'हमसे संपर्क करें',
    'landing.address': 'पता',
    'landing.email': 'ईमेल',
    'landing.phone': 'फोन',
    'landing.follow_us': 'हमें फॉलो करें',
    'landing.foundation_tagline': 'विशेष आवश्यकताओं वाले व्यक्तियों के लिए एक अधिक समावेशी समाज बनाना।',
    'landing.quick_links': 'त्वरित लिंक',
    'landing.newsletter': 'न्यूज़लेटर',
    'landing.newsletter_description': 'नवीनतम अपडेट और समाचारों के लिए हमारे न्यूज़लेटर की सदस्यता लें।',
    'landing.email_placeholder': 'आपका ईमेल पता',
    'landing.subscribe': 'सदस्यता लें',
    'landing.privacy_policy': 'गोपनीयता नीति',
    'landing.terms': 'सेवा की शर्तें',
  },
  kannada: {
    'common.back': 'ಹಿಂದೆ',
    'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'common.save': 'ಉಳಿಸಿ',
    'common.cancel': 'ರದ್ದುಮಾಡಿ',
    'common.submit': 'ಸಲ್ಲಿಸಿ',
    'common.administrator': 'ನಿರ್ವಾಹಕ',
    'common.hr': 'ಮಾನವ ಸಂಪನ್ಮೂಲ',
    'common.teacher': 'ಶಿಕ್ಷಕ',
    'common.parent': 'ಪೋಷಕ',
    'common.error': 'ದೋಷ',
    'common.success': 'ಯಶಸ್ಸು',
    'common.theme.dark': 'ಡಾರ್ಕ್',
    'common.theme.light': 'ಲೈಟ್',
    'common.theme.title': 'ಥೀಮ್',
    'common.language': 'ಭಾಷೆ',
    'common.english': 'ಇಂಗ್ಲಿಷ್',
    'common.hindi': 'ಹಿಂದಿ',
    'common.kannada': 'ಕನ್ನಡ',
    'common.enable': 'ಸಕ್ರಿಯಗೊಳಿಸಿ',
    'common.disable': 'ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ',
    'common.dyslexia': 'ಡಿಸ್ಲೆಕ್ಸಿಯಾ ಮೋಡ್',
    'common.home': 'ಮುಖಪುಟ',
    'common.about': 'ನಮ್ಮ ಬಗ್ಗೆ',
    'common.vision_mission': 'ದೃಷ್ಟಿ ಮತ್ತು ಮಿಷನ್',
    'common.services': 'ಸೇವೆಗಳು',
    'common.contact': 'ಸಂಪರ್ಕಿಸಿ',
    'common.learn_more': 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ',
    
    'login.title': 'ನಿಮ್ಮ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ',
    'login.subtitle': 'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಪ್ರವೇಶಿಸಲು ನಿಮ್ಮ ರುಜುವಾತುಗಳನ್ನು ನಮೂದಿಸಿ',
    'login.email': 'ಇಮೇಲ್ ವಿಳಾಸ',
    'login.password': 'ಪಾಸ್‌ವರ್ಡ್',
    'login.role': 'ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'login.button': 'ಲಾಗಿನ್',
    'login.error': 'ಅಮಾನ್ಯ ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್',
    'login.logout_success': 'ಯಶಸ್ವಿಯಾಗಿ ಲಾಗ್ಔಟ್ ಮಾಡಲಾಗಿದೆ',
    
    'accessibility.title': 'ಪ್ರವೇಶಾರ್ಹತೆ',
    'accessibility.theme': 'ಥೀಮ್',
    'accessibility.language': 'ಭಾಷೆ',
    'accessibility.dyslexia': 'ಡಿಸ್ಲೆಕ್ಸಿಯಾ ಸ್ನೇಹಿ',
    'accessibility.theme_changed': 'ಥೀಮ್ ಬದಲಾಯಿಸಲಾಗಿದೆ',
    'accessibility.language_changed': 'ಭಾಷೆ ಬದಲಾಯಿಸಲಾಗಿದೆ',
    'accessibility.dyslexia_enabled': 'ಡಿಸ್ಲೆಕ್ಸಿಯಾ-ಸ್ನೇಹಿ ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ',
    'accessibility.dyslexia_disabled': 'ಡಿಸ್ಲೆಕ್ಸಿಯಾ-ಸ್ನೇಹಿ ಮೋಡ್ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ',
    
    'dashboard.notifications': 'ಅಧಿಸೂಚನೆಗಳು',
    
    'chatbot.title': 'ಸಹಾಯಕ',
    'chatbot.placeholder': 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ...',
    'chatbot.toggle': 'ಚಾಟ್‌ಬಾಟ್ ಟಾಗಲ್ ಮಾಡಿ',
    'chatbot.close': 'ಮುಚ್ಚಿ',
    'chatbot.welcome': 'ನಮಸ್ಕಾರ! ನಾನು ವಿದ್ಯಾರ್ಥಿಗಳು, ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಇನ್ನಷ್ಟು ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಲು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನೀವು ಏನನ್ನು ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?',
    'chatbot.error': 'ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸಂಸ್ಕರಿಸುವಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    'chatbot.no_results': 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
    
    // Landing page translations
    'landing.hero_title': 'ಸಂಕಲ್ಪ ಪೋರ್ಟಲ್',
    'landing.hero_subtitle': 'ಸೇರ್ಪಡೆಯ ಪಯಣ',
    'landing.hero_description': 'ವಿಶೇಷ ಅಗತ್ಯಗಳನ್ನು ಹೊಂದಿರುವ ವ್ಯಕ್ತಿಗಳಿಗೆ ಬೆಂಬಲ ನೀಡುವ ಇಶಾನ್ಯ ಫೌಂಡೇಶನ್‌ನ ಸಮಗ್ರ ಡೇಟಾಬೇಸ್ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ.',
    'landing.foundation_name': 'ಇಶಾನ್ಯ ಫೌಂಡೇಶನ್',
    'landing.foundation_full_name': 'ಇಶಾನ್ಯ ಇಂಡಿಯಾ ಫೌಂಡೇಶನ್ (IIF)',
    'landing.meaning': '"ಇಶಾನ್ಯ" - ಅರ್ಥ "ಉತ್ತರ-ಪೂರ್ವ," ಶಿಕ್ಷಣ, ಜ್ಞಾನ ಮತ್ತು ಸಮೃದ್ಧಿಯ ಸಂಕೇತ.',
    'landing.about_p1': '2015 ರಲ್ಲಿ ಸ್ಥಾಪಿಸಲಾದ, ',
    'landing.about_p1_cont': ' ವಿಶೇಷ ಅಗತ್ಯಗಳನ್ನು ಹೊಂದಿರುವ ವ್ಯಕ್ತಿಗಳಿಗೆ ಬೆಂಬಲ ನೀಡುತ್ತದೆ ಮತ್ತು ಹೆಚ್ಚು ಸೇರ್ಪಡೆಯ ಸಮಾಜವನ್ನು ರಚಿಸುವ ಗುರಿಯನ್ನು ಹೊಂದಿದೆ. ನಾವು ಆಟಿಸಂ ಸ್ಪೆಕ್ಟ್ರಮ್ ಡಿಸಾರ್ಡರ್, ಆಸ್ಪರ್ಗರ್ ಸಿಂಡ್ರೋಮ್, ಕಲಿಕಾ ಅಂಗವೈಕಲ್ಯಗಳು, ಡೌನ್ ಸಿಂಡ್ರೋಮ್, ADHD ಮತ್ತು ಇತರ ಬೆಳವಣಿಗೆ ಸ್ಥಿತಿಗಳನ್ನು ಹೊಂದಿರುವ ವ್ಯಕ್ತಿಗಳೊಂದಿಗೆ ಕೆಲಸ ಮಾಡುತ್ತೇವೆ.',
    'landing.about_p2': 'ನಮ್ಮ ವಿಧಾನವು ವಿಭಿನ್ನ ಅಗತ್ಯಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ಕಸ್ಟಮೈಸ್ ಮಾಡಿದ ಪಠ್ಯಕ್ರಮವನ್ನು ಬಳಸುತ್ತದೆ ಮತ್ತು ನಮ್ಮ ಎಲ್ಲಾ ಫಲಾನುಭವಿಗಳಿಗೆ ಸಮಗ್ರ ಅಭಿವೃದ್ಧಿ, ಉದ್ಯೋಗ ತರಬೇತಿ ಮತ್ತು ಸ್ವತಂತ್ರ ಜೀವನ ಕೌಶಲ್ಯಗಳನ್ನು ಉತ್ತೇಜಿಸುತ್ತದೆ.',
    'landing.inclusive_education': 'ಸೇರ್ಪಡೆಯ ಶಿಕ್ಷಣ',
    'landing.supportive_community': 'ಬೆಂಬಲ ಸಮುದಾಯ',
    'landing.vision_mission_title': 'ನಮ್ಮ ದೃಷ್ಟಿ ಮತ್ತು ನಮ್ಮ ಮಿಷನ್',
    'landing.vision': 'ದೃಷ್ಟಿ',
    'landing.mission': 'ಮಿಷನ್',
    'landing.vision_text': '"ಅಂಗವಿಕಲತೆ ಹೊಂದಿರುವವರಿಗೆ ವೈವಿಧ್ಯತೆ, ಸಮಾನತೆ ಮತ್ತು ಸೇರ್ಪಡೆಯ ಮೇಲೆ ನಿರ್ಮಿಸಲಾದ ಸಮಾಜ."',
    'landing.mission_1': 'ಪಾಲುದಾರರ ಸಾಮರ್ಥ್ಯ ನಿರ್ಮಾಣ',
    'landing.mission_2': 'ಸೇರ್ಪಡೆಯ ಕಲಿಕೆ ಮತ್ತು ಅಭಿವೃದ್ಧಿ ಸ್ಥಳಗಳನ್ನು ಸೃಷ್ಟಿಸುವುದು',
    'landing.mission_3': 'ಅನುಕೂಲಿತ ಪರಿಹಾರಗಳಿಗೆ ವ್ಯಕ್ತಿ-ಕೇಂದ್ರಿತ ವಿಧಾನ',
    'landing.mission_4': 'ಫಲಾನುಭವಿಗಳಿಂದ ಕೊಡುಗೆದಾರರಿಗೆ ಪರಿವರ್ತನೆ',
    'landing.mission_5': 'ಅಂಗವಿಕಲತೆ ಹೊಂದಿರುವ ವ್ಯಕ್ತಿಗಳಿಗೆ ಸಾಮಾಜಿಕ, ಆರ್ಥಿಕ ಮತ್ತು ರಾಜಕೀಯ ಸೇರ್ಪಡೆಯನ್ನು ಉತ್ತೇಜಿಸುವುದು',
    'landing.mission_6': 'ಸ್ವತಂತ್ರತೆಯನ್ನು ಉತ್ತೇಜಿಸುವುದು ಮತ್ತು ಸೇರ್ಪಡೆಯ ಸಮಾಜಕ್ಕಾಗಿ ಜಾಗೃತಿ ಮೂಡಿಸುವುದು',
    'landing.contact_subtitle': 'ನಮ್ಮ ತಂಡದೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ',
    'landing.reach_out': 'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ',
    'landing.address': 'ವಿಳಾಸ',
    'landing.email': 'ಇಮೇಲ್',
    'landing.phone': 'ಫೋನ್',
    'landing.follow_us': 'ನಮ್ಮನ್ನು ಅನುಸರಿಸಿ',
    'landing.foundation_tagline': 'ವಿಶೇಷ ಅಗತ್ಯಗಳನ್ನು ಹೊಂದಿರುವ ವ್ಯಕ್ತಿಗಳಿಗೆ ಹೆಚ್ಚು ಸೇರ್ಪಡೆಯ ಸಮಾಜವನ್ನು ಸೃಷ್ಟಿಸುವುದು.',
    'landing.quick_links': 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು',
    'landing.newsletter': 'ಸುದ್ದಿಪತ್ರ',
    'landing.newsletter_description': 'ಇತ್ತೀಚಿನ ಅಪ್‌ಡೇಟ್‌ಗಳು ಮತ್ತು ಸುದ್ದಿಗಳಿಗಾಗಿ ನಮ್ಮ ಸುದ್ದಿಪತ್ರಕ್ಕೆ ಚಂದಾದಾರರಾಗಿ.',
    'landing.email_placeholder': 'ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸ',
    'landing.subscribe': 'ಚಂದಾದಾರರಾಗಿ',
    'landing.privacy_policy': 'ಗೌಪ್ಯತಾ ನೀತಿ',
    'landing.terms': 'ಸೇವಾ ನಿಯಮಗಳು',
  },
};

// Language Provider component
type LanguageProviderProps = {
  children: ReactNode;
  defaultLanguage?: Language;
};

export const LanguageProvider = ({ children, defaultLanguage = 'english' }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || defaultLanguage;
  });

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
    
    // Notify user about language change
    const timer = setTimeout(() => {
      const root = document.documentElement;
      const style = document.createElement('style');
      style.id = 'language-transition';
      style.innerHTML = `
        * {
          transition: all 0.3s ease;
        }
      `;
      
      document.head.appendChild(style);
      
      setTimeout(() => {
        const languageTransition = document.getElementById('language-transition');
        if (languageTransition) {
          languageTransition.remove();
        }
      }, 500);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [language]);

  // Translation function
  const t = (key: string): string | undefined => {
    return translations[language]?.[key];
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// Custom hook for using the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
