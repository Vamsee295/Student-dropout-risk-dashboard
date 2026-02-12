"use client";

const months = ["Sep", "Oct", "Nov", "Dec", "Jan"];
const days = ["Mon", "", "Wed", "", "Fri"];

// Generate deterministic data for approx 5 months (Sep to Jan)
// 5 months * ~4.5 weeks = ~22-24 weeks. Let's do 28 weeks to fill the width.
const generateHeatmapData = () => {
    const data = [];
    for (let i = 0; i < 35; i++) { // Increased to 35 weeks for full width look
        const week = [];
        for (let j = 0; j < 7; j++) {
            // Deterministic intensity 0-4 using sine wave simulation
            // Adjusting frequency for a more scattered look
            const val = Math.floor(Math.abs(Math.sin(i * 0.5 + j * 0.8)) * 5);
            // Ensure some empty spots (0) for realism
            const finalVal = Math.random() > 0.8 ? 0 : val;
            // Note: Math.random here will cause hydration mismatch again if not careful.
            // Reverting to pure math for safety:
            const pseudoRandom = Math.abs(Math.sin(i * 13 + j * 7));
            const level = pseudoRandom > 0.8 ? 0 : Math.floor(pseudoRandom * 5);
            week.push(level);
        }
        data.push(week);
    }
    return data;
};

const heatmapData = generateHeatmapData();

const getColor = (level: number) => {
    switch (level) {
        case 0: return "bg-gray-100";
        case 1: return "bg-emerald-200"; // Lighter
        case 2: return "bg-emerald-300";
        case 3: return "bg-teal-400";
        case 4: return "bg-teal-500 text-white"; // Darkest
        default: return "bg-gray-100";
    }
};

export function LMSHeatmapChart() {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-blue-600 text-xl">👣</span>
                    <h3 className="font-bold text-gray-900">Digital Footprint (LMS Logins)</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Less active</span>
                    <div className="flex gap-1">
                        <span className="w-3 h-3 rounded-[2px] bg-gray-100"></span>
                        <span className="w-3 h-3 rounded-[2px] bg-emerald-200"></span>
                        <span className="w-3 h-3 rounded-[2px] bg-emerald-300"></span>
                        <span className="w-3 h-3 rounded-[2px] bg-teal-400"></span>
                        <span className="w-3 h-3 rounded-[2px] bg-teal-500"></span>
                    </div>
                    <span>More active</span>
                </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar">
                <div className="min-w-[800px] w-full">
                    {/* Month Labels - Approx spacing */}
                    <div className="flex mb-2 pl-8 justify-between w-[95%]">
                        {months.map((m) => (
                            <div key={m} className="text-xs text-gray-400 font-medium">{m}</div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {/* Day Labels */}
                        <div className="flex flex-col justify-between pt-1 pb-1 text-[10px] text-gray-400 h-[110px] w-6 shrink-0">
                            {days.map((d, i) => <span key={i} className="h-3 leading-3">{d}</span>)}
                        </div>

                        {/* Heatmap Grid */}
                        {/* We need to transpose the data matrix effectively to map rows as Days and columns as Weeks if using flex-row for weeks.
                             Currently: Data is [Week1[Day1..7], Week2...].
                             Rendering outer map as weeks (columns) works for visual matching of GitHub style.
                         */}
                        <div className="flex flex-1 gap-[3px]">
                            {heatmapData.map((week, wIndex) => (
                                <div key={wIndex} className="flex flex-col gap-[3px]">
                                    {week.map((level, dIndex) => (
                                        <div
                                            key={`${wIndex}-${dIndex}`}
                                            className={`w-3.5 h-3.5 rounded-[2px] ${getColor(level)} hover:opacity-80 transition-opacity cursor-pointer`}
                                            title={`Activity Level: ${level}`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
