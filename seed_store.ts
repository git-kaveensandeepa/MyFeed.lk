import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0797933634",
  appId: "1:203252959685:web:ffcea46dc94edc1675e3ac",
  apiKey: "AIzaSyDyNb52a42_PXS929gTeeKdY3TomCyQYuE",
  authDomain: "gen-lang-client-0797933634.firebaseapp.com",
  storageBucket: "gen-lang-client-0797933634.firebasestorage.app",
  messagingSenderId: "203252959685",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-myfeedlk-576ec80c-841c-44ac-9b2a-8b4ec4ec22e7");

const items = [
    {
      id: 'apple_airpods_pro',
      title: 'Apple AirPods Pro 2',
      titleSinhala: 'Apple AirPods Pro',
      description: 'Noise Cancellation සහිත Apple AirPods Pro අත්දැකීම ලබාගන්න.',
      points: 50000,
      icon: 'headphones',
      colorClass: 'text-[#000000]',
      bgClass: 'bg-gradient-to-tr from-gray-700 to-gray-900',
      imageUrl: ''
    },
    {
      id: 'jbl_go_3',
      title: 'JBL Go 3 Bluetooth Speaker',
      titleSinhala: 'JBL Go 3 ස්පීකරය',
      description: 'හොඳම Sound Quality එකක් තියෙන Original JBL Bluetooth Speaker එකක්.',
      points: 20000,
      icon: 'speaker',
      colorClass: 'text-[#FF3B30]',
      bgClass: 'bg-gradient-to-tr from-[#FF3B30] to-[#FF6B22]',
      imageUrl: ''
    },
    {
      id: 'mi_smart_band_8',
      title: 'Xiaomi Smart Band 8',
      titleSinhala: 'Xiaomi Smart Band 8',
      description: 'ඔබගේ සෞඛ්‍යය මැනගන්න හොඳම Smart Fitness Band එකක්.',
      points: 15000,
      icon: 'watch',
      colorClass: 'text-[#007AFF]',
      bgClass: 'bg-gradient-to-tr from-[#007AFF] to-[#34C759]',
      imageUrl: ''
    },
    {
      id: 'power_bank_10000',
      title: 'Baseus 10000mAh Power Bank',
      titleSinhala: 'Baseus 10000mAh Power Bank',
      description: 'Fast Charging පහසුකම සහිත 10000mAh පවර් බෑන්ක් එකක්.',
      points: 10000,
      icon: 'battery_charging_full',
      colorClass: 'text-[#FFCC00]',
      bgClass: 'bg-gradient-to-tr from-[#FF9500] to-[#FFCC00]',
      imageUrl: ''
    },
    {
      id: 'myfeed_tshirt',
      title: 'MyFeed.lk Official T-Shirt',
      titleSinhala: 'MyFeed.lk නිල T-Shirt එක',
      description: 'MyFeed.lk Logo එක සහිත විශේෂිත T-Shirt එකක්.',
      points: 5000,
      icon: 'checkroom',
      colorClass: 'text-[#5856D6]',
      bgClass: 'bg-gradient-to-tr from-[#5856D6] to-[#AF52DE]',
      imageUrl: ''
    }
];

async function seed() {
  for (const item of items) {
    await setDoc(doc(db, 'store_items', item.id), item);
    console.log('Added', item.id);
  }
}
seed().then(() => { process.exit(0); }).catch(console.error);
