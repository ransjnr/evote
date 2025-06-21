import React from "react";

interface NomineeFlyerProps {
  nominee: {
    name: string;
    code: string;
    description?: string;
    imageUrl?: string;
  };
  category: {
    name: string;
  };
  event: {
    name: string;
    votePrice?: number;
    endDate?: string;
  };
  department: {
    name: string;
  };
  votingUrl: string;
  ussdCode: string;
}

export function NomineeFlyer({
  nominee,
  category,
  event,
  department,
  votingUrl,
  ussdCode,
}: NomineeFlyerProps) {
  const cleanUrl = votingUrl.replace(/^https?:\/\//, "");

  return (
    <div
      className="w-[600px] h-[600px] relative overflow-hidden rounded-lg shadow-xl"
      style={{
        background:
          "linear-gradient(135deg, #D2691E 0%, #A0522D 50%, #8B4513 100%)",
      }}
    >
      {/* Header Section */}
      <div className="p-4 flex justify-between items-start">
        {/* Left - University Info */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">🏛️</span>
            </div>
          </div>
          <div className="text-white">
            <div className="font-bold text-xs leading-tight">
              {department.name.toUpperCase()}
            </div>
            <div className="text-xs opacity-90">{event.name.toUpperCase()}</div>
          </div>
        </div>

        {/* Right - Greeting Text */}
        <div className="text-white text-right max-w-xs">
          <p className="text-xs leading-snug">
            Greetings Family, I am happy to officially inform you that I am part
            of the finalist for {category.name} {event.name}. I will please need
            your Votes
          </p>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="px-4 flex gap-4 h-[380px]">
        {/* Left - Photo */}
        <div className="flex-shrink-0">
          <div className="w-40 h-48 bg-yellow-400 rounded-xl p-1.5">
            <div className="w-full h-full rounded-lg overflow-hidden">
              {nominee.imageUrl ? (
                <img
                  src={nominee.imageUrl}
                  alt={nominee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-700">
                    {nominee.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right - Voting Info */}
        <div className="flex-1 text-white space-y-3">
          {/* Nominee Code */}
          <div>
            <span className="text-white text-lg font-medium">
              Nominee code:
            </span>
            <span className="text-yellow-400 text-xl font-bold ml-1">
              {nominee.code}
            </span>
          </div>

          {/* Voting Process Box */}
          <div className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg">
            <span className="font-bold text-base">VOTING PROCESS</span>
          </div>

          {/* USSD Instructions */}
          <div className="text-xs">
            <p className="font-bold mb-1">DIAL "{ussdCode}"</p>
            <div className="space-y-0.5 text-xs">
              <p>ENTER NOMINEE CODE</p>
              <p>ENTER NUMBER OF VOTES</p>
              <p>WAIT FOR MOMO PROMPT</p>
              <p>ENTER MOMO PIN TO FINISH VOTING</p>
            </div>
          </div>

          {/* OR Button */}
          <div className="flex justify-center">
            <div className="bg-yellow-400 text-black px-4 py-1 rounded-full font-bold text-base">
              OR
            </div>
          </div>

          {/* Web Instructions */}
          <div className="text-xs">
            <p className="font-bold mb-1">VISIT {cleanUrl}</p>
            <div className="space-y-0.5 text-xs">
              <p>SELECT EVENT AND SELECT CATEGORY</p>
              <p>PROCEED TO VOTE AND ENTER DETAILS</p>
              <p>ENTER VERIFICATION CODE</p>
              <p>ENTER PIN TO FINISH VOTING</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex gap-1.5">
            <div className="w-8 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">
              MTN
            </div>
            <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
              VDF
            </div>
            <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
              AT
            </div>
            <div className="w-8 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">
              VISA
            </div>
            <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
              MC
            </div>
          </div>
        </div>
      </div>

      {/* Nominee Name Section */}
      <div className="absolute bottom-16 left-4 right-4">
        <div className="bg-blue-600 text-white px-3 py-1.5 rounded-t-lg">
          <span className="font-bold text-sm">NOMINEE NAME</span>
        </div>
        <div className="bg-white text-black px-3 py-2 rounded-b-lg">
          <span className="font-bold text-lg">
            {nominee.name.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white p-3">
        <div className="flex justify-between items-center text-black text-xs">
          <div className="flex items-center gap-2">
            <div>
              <div className="font-bold text-xs">MBROFIX</div>
              <div className="text-xs">DESIGN</div>
            </div>
            <div className="w-6 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
              LOGO
            </div>
          </div>

          <div className="text-center">
            <div className="font-bold text-xs">GRAND FINALE DATE:</div>
            <div className="text-sm font-bold">
              {new Date(event.endDate || Date.now()).toLocaleDateString(
                "en-GB",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="font-bold text-xs">VENUE:</div>
            <div className="text-sm font-bold">{department.name}</div>
          </div>

          <div className="text-center">
            <div className="font-bold text-xs">TIME:</div>
            <div className="text-sm font-bold">6PM</div>
          </div>
        </div>
      </div>
    </div>
  );
}
