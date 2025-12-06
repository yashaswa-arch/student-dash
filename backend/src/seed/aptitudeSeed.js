const mongoose = require('mongoose');
const AptitudeQuestion = require('../models/AptitudeQuestion');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const connectDB = require('../config/database');

const questions = [
  // ========== PERCENTAGES ==========
  // Easy (6 questions)
  {
    topic: 'Percentages',
    questionText: 'What is 25% of 200?',
    options: ['40', '50', '60', '75'],
    correctIndex: 1,
    explanation: '25% of 200 = (25/100) × 200 = 0.25 × 200 = 50',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Percentages',
    questionText: 'If 20% of a number is 40, what is the number?',
    options: ['150', '200', '250', '300'],
    correctIndex: 1,
    explanation: 'Let the number be x. Then 20% of x = 40, so (20/100) × x = 40, which gives x = 40 × 100/20 = 200',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Percentages',
    questionText: 'A student scored 75 out of 100. What is the percentage?',
    options: ['65%', '70%', '75%', '80%'],
    correctIndex: 2,
    explanation: 'Percentage = (75/100) × 100 = 75%',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Percentages',
    questionText: 'What is 15% of 80?',
    options: ['10', '12', '15', '18'],
    correctIndex: 1,
    explanation: '15% of 80 = (15/100) × 80 = 0.15 × 80 = 12',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Percentages',
    questionText: 'If the price of an item increases by 20%, and the new price is ₹120, what was the original price?',
    options: ['₹90', '₹100', '₹110', '₹115'],
    correctIndex: 1,
    explanation: 'Let original price be x. After 20% increase: x × 1.20 = 120, so x = 120/1.20 = ₹100',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Percentages',
    questionText: 'What is 30% of 150?',
    options: ['35', '40', '45', '50'],
    correctIndex: 2,
    explanation: '30% of 150 = (30/100) × 150 = 0.30 × 150 = 45',
    difficulty: 'easy',
    isActive: true
  },
  
  // Medium (4 questions)
  {
    topic: 'Percentages',
    questionText: 'A number is increased by 30% and then decreased by 20%. What is the net percentage change?',
    options: ['+4%', '+6%', '+8%', '+10%'],
    correctIndex: 0,
    explanation: 'Let the number be 100. After 30% increase: 130. After 20% decrease: 130 × 0.80 = 104. Net change = +4%',
    difficulty: 'medium',
    isActive: true
  },
  {
    topic: 'Percentages',
    questionText: 'In a class of 60 students, 40% are girls. How many boys are there?',
    options: ['24', '30', '36', '40'],
    correctIndex: 2,
    explanation: 'Girls = 40% of 60 = 24. Boys = 60 - 24 = 36',
    difficulty: 'medium',
    isActive: true
  },
  {
    topic: 'Percentages',
    questionText: 'If 35% of a number is 70, what is 60% of that number?',
    options: ['100', '110', '120', '130'],
    correctIndex: 2,
    explanation: 'Let the number be x. 35% of x = 70, so x = 70 × 100/35 = 200. Then 60% of 200 = 120',
    difficulty: 'medium',
    isActive: true
  },
  {
    topic: 'Percentages',
    questionText: 'A shopkeeper marks an item 40% above cost price and gives a discount of 10%. What is his profit percentage?',
    options: ['24%', '26%', '28%', '30%'],
    correctIndex: 1,
    explanation: 'Let CP = 100. Marked price = 140. After 10% discount, SP = 140 × 0.90 = 126. Profit = 26%',
    difficulty: 'medium',
    isActive: true
  },
  
  // Hard (2 questions)
  {
    topic: 'Percentages',
    questionText: 'In an election, candidate A got 45% of votes and candidate B got 30% of votes. If 12,500 votes were cast, how many votes did the third candidate get?',
    options: ['2,500', '3,000', '3,125', '3,500'],
    correctIndex: 2,
    explanation: 'A got 45%, B got 30%, so third candidate got 25%. Votes = 25% of 12,500 = 3,125',
    difficulty: 'hard',
    isActive: true
  },
  {
    topic: 'Percentages',
    questionText: 'The population of a town increases by 15% annually. If the current population is 23,000, what was it 2 years ago?',
    options: ['17,000', '17,391', '18,000', '18,500'],
    correctIndex: 1,
    explanation: 'Let population 2 years ago be x. After 2 years of 15% increase: x × 1.15² = 23,000, so x = 23,000/1.3225 ≈ 17,391',
    difficulty: 'hard',
    isActive: true
  },

  // ========== PROFIT AND LOSS ==========
  // Easy (6 questions)
  {
    topic: 'Profit and Loss',
    questionText: 'A shopkeeper buys an item for ₹500 and sells it for ₹600. What is his profit percentage?',
    options: ['15%', '18%', '20%', '25%'],
    correctIndex: 2,
    explanation: 'Profit = ₹600 - ₹500 = ₹100. Profit % = (100/500) × 100 = 20%',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Profit and Loss',
    questionText: 'If the cost price is ₹200 and the selling price is ₹150, what is the loss percentage?',
    options: ['20%', '25%', '30%', '35%'],
    correctIndex: 1,
    explanation: 'Loss = ₹200 - ₹150 = ₹50. Loss % = (50/200) × 100 = 25%',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Profit and Loss',
    questionText: 'A trader sells an item at a profit of 25%. If the cost price is ₹400, what is the selling price?',
    options: ['₹450', '₹500', '₹550', '₹600'],
    correctIndex: 1,
    explanation: 'Profit = 25% of ₹400 = ₹100. Selling price = ₹400 + ₹100 = ₹500',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Profit and Loss',
    questionText: 'An item is sold for ₹360 at a loss of 10%. What was the cost price?',
    options: ['₹380', '₹390', '₹400', '₹410'],
    correctIndex: 2,
    explanation: 'If CP = x, then SP = 0.90x = 360, so x = 360/0.90 = ₹400',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Profit and Loss',
    questionText: 'If cost price is ₹300 and profit is ₹60, what is the profit percentage?',
    options: ['18%', '20%', '22%', '25%'],
    correctIndex: 1,
    explanation: 'Profit % = (60/300) × 100 = 20%',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Profit and Loss',
    questionText: 'A shopkeeper sells a pen for ₹12 and makes a profit of 20%. What is the cost price?',
    options: ['₹8', '₹9', '₹10', '₹11'],
    correctIndex: 2,
    explanation: 'If CP = x, then SP = 1.20x = 12, so x = 12/1.20 = ₹10',
    difficulty: 'easy',
    isActive: true
  },
  
  // Medium (4 questions)
  {
    topic: 'Profit and Loss',
    questionText: 'A shopkeeper marks an item 30% above cost price and gives a discount of 10%. What is his profit percentage?',
    options: ['15%', '17%', '20%', '23%'],
    correctIndex: 1,
    explanation: 'Let CP = 100. Marked price = 130. After 10% discount, SP = 130 × 0.90 = 117. Profit = 17%',
    difficulty: 'medium',
    isActive: true
  },
  {
    topic: 'Profit and Loss',
    questionText: 'By selling 20 items, a trader gains the selling price of 5 items. What is his profit percentage?',
    options: ['25%', '30%', '33.33%', '40%'],
    correctIndex: 2,
    explanation: 'Let SP of 1 item = x. SP of 20 = 20x. Profit = 5x. CP of 20 = 20x - 5x = 15x. Profit % = (5x/15x) × 100 = 33.33%',
    difficulty: 'medium',
    isActive: true
  },
  {
    topic: 'Profit and Loss',
    questionText: 'A shopkeeper offers a discount of 20% and still makes a profit of 20%. If the marked price is ₹600, what is the cost price?',
    options: ['₹380', '₹400', '₹420', '₹450'],
    correctIndex: 1,
    explanation: 'Marked price = ₹600. After 20% discount, SP = ₹600 × 0.80 = ₹480. If profit is 20%, then CP = ₹480/1.20 = ₹400',
    difficulty: 'medium',
    isActive: true
  },
  {
    topic: 'Profit and Loss',
    questionText: 'If the selling price of 15 items equals the cost price of 20 items, what is the profit or loss percentage?',
    options: ['25% loss', '25% profit', '33.33% profit', '33.33% loss'],
    correctIndex: 3,
    explanation: 'SP of 15 = CP of 20. So SP of 1 = CP of 20/15 = 1.333 CP. But wait, if SP of 15 = CP of 20, then CP of 1 = SP of 15/20 = 0.75 SP. This means CP > SP, so loss. Loss = 25%',
    difficulty: 'medium',
    isActive: true
  },
  
  // Hard (2 questions)
  {
    topic: 'Profit and Loss',
    questionText: 'A trader buys goods at 20% discount on marked price. He marks up the goods by 25% and gives a discount of 10%. What is his profit percentage?',
    options: ['10%', '12.5%', '15%', '17.5%'],
    correctIndex: 1,
    explanation: 'Let marked price = 100. CP = 80 (20% discount). New marked price = 80 × 1.25 = 100. After 10% discount, SP = 90. Profit = 10, Profit % = (10/80) × 100 = 12.5%',
    difficulty: 'hard',
    isActive: true
  },
  {
    topic: 'Profit and Loss',
    questionText: 'A trader sells two items at ₹600 each. On one he gains 20% and on the other he loses 20%. What is his overall profit or loss?',
    options: ['4% loss', '4% profit', 'No profit no loss', 'Cannot be determined'],
    correctIndex: 0,
    explanation: 'Item 1: CP = 600/1.20 = 500. Item 2: CP = 600/0.80 = 750. Total CP = 1250, Total SP = 1200. Loss = 50, Loss % = (50/1250) × 100 = 4%',
    difficulty: 'hard',
    isActive: true
  },

  // ========== TIME AND WORK ==========
  // Easy (6 questions)
  {
    topic: 'Time and Work',
    questionText: 'A can complete a work in 10 days. How much work can he do in 1 day?',
    options: ['1/5', '1/10', '1/15', '1/20'],
    correctIndex: 1,
    explanation: 'If A completes work in 10 days, in 1 day he completes 1/10 of the work',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Time and Work',
    questionText: 'A and B together can complete a work in 6 days. If A alone takes 12 days, how many days will B alone take?',
    options: ['8 days', '10 days', '12 days', '15 days'],
    correctIndex: 2,
    explanation: 'A\'s 1 day work = 1/12. Together 1 day work = 1/6. B\'s 1 day work = 1/6 - 1/12 = 1/12. So B takes 12 days',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Time and Work',
    questionText: 'If 5 workers can complete a job in 8 days, how many workers are needed to complete it in 4 days?',
    options: ['8', '10', '12', '15'],
    correctIndex: 1,
    explanation: 'Work = 5 × 8 = 40 worker-days. For 4 days: workers needed = 40/4 = 10',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Time and Work',
    questionText: 'A can do a piece of work in 15 days and B can do it in 20 days. How long will they take working together?',
    options: ['8 days', '8.57 days', '9 days', '10 days'],
    correctIndex: 1,
    explanation: 'A\'s 1 day work = 1/15, B\'s 1 day work = 1/20. Together = 1/15 + 1/20 = 7/60. Time = 60/7 = 8.57 days',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Time and Work',
    questionText: 'If a machine can produce 100 units in 5 hours, how many units can it produce in 8 hours?',
    options: ['140', '150', '160', '180'],
    correctIndex: 2,
    explanation: 'Rate = 100/5 = 20 units/hour. In 8 hours = 20 × 8 = 160 units',
    difficulty: 'easy',
    isActive: true
  },
  {
    topic: 'Time and Work',
    questionText: 'A can complete 2/3 of a work in 10 days. How long will he take to complete the whole work?',
    options: ['12 days', '13 days', '14 days', '15 days'],
    correctIndex: 3,
    explanation: '2/3 work in 10 days. 1 work in = 10 × 3/2 = 15 days',
    difficulty: 'easy',
    isActive: true
  },
  
  // Medium (4 questions)
  {
    topic: 'Time and Work',
    questionText: 'A, B, and C can complete a work in 12, 15, and 20 days respectively. If they work together, how long will they take?',
    options: ['4 days', '5 days', '6 days', '7 days'],
    correctIndex: 1,
    explanation: 'A\'s work = 1/12, B\'s = 1/15, C\'s = 1/20. Together = 1/12 + 1/15 + 1/20 = 5/60 + 4/60 + 3/60 = 12/60 = 1/5. Time = 5 days',
    difficulty: 'medium',
    isActive: true
  },
  {
    topic: 'Time and Work',
    questionText: 'A can do a work in 8 days. B is 50% more efficient than A. How long will B take to complete the same work?',
    options: ['4 days', '5.33 days', '6 days', '7 days'],
    correctIndex: 1,
    explanation: 'A takes 8 days. B is 50% more efficient, so B is 1.5 times faster. B takes 8/1.5 = 5.33 days',
    difficulty: 'medium',
    isActive: true
  },
  {
    topic: 'Time and Work',
    questionText: 'If 12 men can complete a work in 10 days, how many additional men are needed to complete it in 6 days?',
    options: ['6', '8', '10', '12'],
    correctIndex: 1,
    explanation: 'Work = 12 × 10 = 120 man-days. For 6 days: men needed = 120/6 = 20. Additional = 20 - 12 = 8',
    difficulty: 'medium',
    isActive: true
  },
  {
    topic: 'Time and Work',
    questionText: 'A and B can do a work in 12 days, B and C in 15 days, and A and C in 20 days. How long will A alone take?',
    options: ['20 days', '24 days', '30 days', '36 days'],
    correctIndex: 2,
    explanation: 'A+B = 1/12, B+C = 1/15, A+C = 1/20. Adding: 2(A+B+C) = 1/12 + 1/15 + 1/20 = 5/60 + 4/60 + 3/60 = 12/60 = 1/5. So A+B+C = 1/10. A = 1/10 - 1/15 = 3/30 - 2/30 = 1/30. A takes 30 days',
    difficulty: 'medium',
    isActive: true
  },
  
  // Hard (2 questions)
  {
    topic: 'Time and Work',
    questionText: 'A pipe can fill a tank in 6 hours. Due to a leak, it takes 8 hours to fill. How long will the leak take to empty the full tank?',
    options: ['12 hours', '18 hours', '24 hours', '30 hours'],
    correctIndex: 2,
    explanation: 'Filling rate = 1/6 per hour. With leak, rate = 1/8 per hour. Leak rate = 1/6 - 1/8 = 4/24 - 3/24 = 1/24 per hour. Time to empty = 24 hours',
    difficulty: 'hard',
    isActive: true
  },
  {
    topic: 'Time and Work',
    questionText: 'Two pipes A and B can fill a tank in 12 and 18 hours respectively. Both pipes are opened together, but after 3 hours, pipe B is closed. How long will it take to fill the remaining part of the tank?',
    options: ['5 hours', '6 hours', '7 hours', '8 hours'],
    correctIndex: 2,
    explanation: 'A\'s rate = 1/12 per hour, B\'s rate = 1/18 per hour. Together rate = 1/12 + 1/18 = 5/36 per hour. In 3 hours, both fill 3 × 5/36 = 15/36 = 5/12. Remaining = 1 - 5/12 = 7/12. Now only A works. A takes 7/12 ÷ 1/12 = 7 hours to fill remaining',
    difficulty: 'hard',
    isActive: true
  }
];

async function seedAptitudeQuestions() {
  try {
    await connectDB();
    console.log('🗄️  Connected to MongoDB');

    // Clear existing questions
    await AptitudeQuestion.deleteMany({});
    console.log('🧹 Cleared existing aptitude questions');

    // Insert questions
    await AptitudeQuestion.insertMany(questions);
    console.log(`✅ Successfully seeded ${questions.length} aptitude questions`);

    // Display summary
    const summary = await AptitudeQuestion.aggregate([
      {
        $group: {
          _id: { topic: '$topic', difficulty: '$difficulty' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.topic': 1, '_id.difficulty': 1 }
      }
    ]);

    console.log('\n📊 Summary by Topic and Difficulty:');
    summary.forEach(item => {
      console.log(`   ${item._id.topic} - ${item._id.difficulty}: ${item.count} questions`);
    });

    // Total by topic
    const topicSummary = await AptitudeQuestion.aggregate([
      {
        $group: {
          _id: '$topic',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log('\n📈 Total by Topic:');
    topicSummary.forEach(item => {
      console.log(`   ${item._id}: ${item.count} questions`);
    });

    console.log('\n🎉 Aptitude questions seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding aptitude questions:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedAptitudeQuestions();
}

module.exports = { seedAptitudeQuestions, questions };

