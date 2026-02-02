import { NextRequest, NextResponse } from "next/server";

// Roast templates based on performance tiers
const ROASTS = {
  catastrophic: [ // < -50%
    "Your portfolio is performing worse than a GameStop short seller's marriage.",
    "At this rate, you could've made more money setting your cash on fire for warmth.",
    "Your financial advisor just updated their LinkedIn to 'Open to Work'.",
    "Even FTX customers are feeling sorry for you right now.",
    "Your portfolio chart looks like it's trying to reach the Earth's core.",
    "Congratulations! You've achieved what Wall Street calls 'generational poverty'.",
  ],
  terrible: [ // -50% to -30%
    "Your portfolio has more red than a matador convention.",
    "Have you considered that 'buy high, sell low' isn't actually a strategy?",
    "Your investment thesis is basically 'what if I made every wrong decision possible?'",
    "Even a blindfolded monkey with a dartboard would have done better.",
    "Your portfolio is so bad, it's being used as a case study in what NOT to do.",
  ],
  bad: [ // -30% to -10%
    "You're not losing money, you're just aggressively donating to market makers.",
    "Your portfolio is the financial equivalent of stepping on a Lego every day.",
    "Diamond hands? More like lead hands dragging you to the bottom.",
    "At least you can claim these losses on your taxes... for the next decade.",
    "Your portfolio performance would make a financial advisor cry.",
  ],
  meh: [ // -10% to +10%
    "Your portfolio is as exciting as watching paint dry, but less profitable.",
    "Congratulations on achieving peak mediocrity.",
    "You've somehow managed to beat inflation... oh wait, no you haven't.",
    "Your returns are flatter than the Earth according to some people.",
    "A savings account would have been revolutionary for you.",
  ],
  decent: [ // +10% to +30%
    "Look at you, Mr./Ms. 'I Actually Read The News Before Investing'.",
    "Not bad! Your portfolio is almost keeping up with the S&P... almost.",
    "You're officially doing better than 60% of hedge fund managers. Low bar, but still.",
    "Your portfolio is green! Someone learned that stocks can go up!",
  ],
  good: [ // +30% to +100%
    "Okay, we see you! Did you travel back in time with a sports almanac?",
    "Your portfolio is performing better than most relationships last.",
    "Quick, screenshot this before it all goes away like your ex.",
    "Wall Street wants to know your location... for tax purposes.",
  ],
  legendary: [ // > +100%
    "Are you a time traveler? Be honest.",
    "Please share your insider trading tips... asking for a friend (who is the SEC).",
    "Your portfolio gains have their own zip code.",
    "Congratulations, you've unlocked: Early Retirement (maybe).",
    "Your returns are so good, I'm checking if this app has a bug.",
  ],
};

function getRoastTier(percentageReturn: number): keyof typeof ROASTS {
  if (percentageReturn < -50) return "catastrophic";
  if (percentageReturn < -30) return "terrible";
  if (percentageReturn < -10) return "bad";
  if (percentageReturn < 10) return "meh";
  if (percentageReturn < 30) return "decent";
  if (percentageReturn < 100) return "good";
  return "legendary";
}

function getRandomRoast(tier: keyof typeof ROASTS): string {
  const roasts = ROASTS[tier];
  return roasts[Math.floor(Math.random() * roasts.length)];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const returnParam = searchParams.get("return");
  const ticker = searchParams.get("ticker");

  if (!returnParam) {
    return NextResponse.json({ error: "Missing return parameter" }, { status: 400 });
  }

  const percentageReturn = parseFloat(returnParam);
  if (isNaN(percentageReturn)) {
    return NextResponse.json({ error: "Invalid return value" }, { status: 400 });
  }

  const tier = getRoastTier(percentageReturn);
  let roast = getRandomRoast(tier);

  // Personalize with ticker if provided
  if (ticker) {
    const tickerRoasts: Record<string, string> = {
      TSLA: " Elon's tweets aged like milk, huh?",
      GME: " At least you have the memes.",
      AMC: " The real movie was the losses we made along the way.",
      DOGE: " Much wow. Very loss.",
      PEPE: " The frog has hopped away with your money.",
      BTC: " HODL they said. It'll be fun they said.",
      ETH: " The merge was supposed to fix everything!",
      SOL: " Solana: Sometimes Online, Losses Always.",
    };
    if (tickerRoasts[ticker.toUpperCase()]) {
      roast += tickerRoasts[ticker.toUpperCase()];
    }
  }

  return NextResponse.json({
    roast,
    tier,
    percentageReturn,
  });
}
