/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import {
  Compass, Calendar, Clock, MapPin, Download,
  Plane, Hotel, Utensils, Car, Sparkles, AlertCircle, Loader2
} from "lucide-react";

export default function SharedItinerary() {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await api.get(`/itinerary/share/${id}`);
        if (response.data?.success) {
          const it = response.data.data;
          setItinerary(it);
          setParsedData(JSON.parse(it.itineraryData));
        }
      } catch (err) {
        setError("This itinerary could not be found or is unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [id]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "flight":     return <Plane className="text-red-400"     size={16} />;
      case "hotel":      return <Hotel className="text-amber-400"   size={16} />;
      case "dining":     return <Utensils className="text-emerald-400" size={16} />;
      case "sightseeing":return <Compass className="text-cyan-400"  size={16} />;
      case "transit":    return <Car className="text-gray-400"      size={16} />;
      default:           return <Calendar className="text-indigo-400" size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-500 mx-auto mb-4" size={48} />
          <p className="text-gray-400 text-sm">Loading shared itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4">
        <div className="text-center bg-white/5 border border-white/10 rounded-2xl p-10 max-w-md">
          <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Itinerary Not Found</h2>
          <p className="text-gray-400 text-sm">{error || "This link may have expired or been removed."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">

      {/* Top Bar */}
      <header className="bg-gray-950/70 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Sparkles className="text-indigo-500 animate-pulse" size={20} />
          <span className="font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent text-lg">
            AI Travel Itinerary
          </span>
        </div>
        <a
          href={itinerary.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md shadow-indigo-600/20"
        >
          <Download size={15} />
          Download PDF
        </a>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-xl">
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            Shared Travel Plan
          </span>
          <h1 className="text-3xl font-black text-white mt-2 mb-1">
            {parsedData?.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
            <MapPin size={14} className="text-red-400" />
            <span>{parsedData?.destination}</span>
          </div>
          <p className="mt-4 text-sm text-gray-300 leading-relaxed border-t border-gray-800 pt-4">
            {parsedData?.overview}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="flex border-b border-gray-800 mb-6">
          {[
            { key: "overview", label: "Overview",   icon: <Compass size={15} /> },
            { key: "timeline", label: "Day Plan",   icon: <Calendar size={15} /> },
            { key: "tips",     label: "Travel Tips",icon: <AlertCircle size={15} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-1.5 transition ${
                activeTab === tab.key
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {itinerary.uploads?.[0]?.fileName?.map((name, idx) => (
              <a
                key={idx}
                href={itinerary.uploads[0]?.fileUrl?.[idx]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-gray-900/40 border border-gray-800 hover:border-gray-700 rounded-xl text-xs text-gray-400 hover:text-indigo-400 transition"
              >
                <Download size={13} />
                <span className="truncate flex-1">{name}</span>
              </a>
            ))}
            {(!itinerary.uploads || itinerary.uploads.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-8">No source documents attached.</p>
            )}
          </div>
        )}

        {/* Timeline */}
        {activeTab === "timeline" && (
          <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-800">
            {parsedData?.days.map((day) => (
              <div key={day.dayNumber} className="relative pl-10 space-y-4">
                <div className="absolute left-[-2px] top-1 w-9 h-9 rounded-full bg-indigo-950 border-2 border-indigo-500 flex items-center justify-center shadow-lg">
                  <span className="text-xs font-black text-indigo-400">{day.dayNumber}</span>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">{day.theme}</h3>
                  {day.date && <p className="text-xs text-gray-500">{day.date}</p>}
                </div>
                <div className="space-y-3">
                  {day.activities.map((act, idx) => (
                    <div key={idx} className="p-4 bg-gray-900/30 border border-gray-800 rounded-xl space-y-2 hover:border-gray-700 transition">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getActivityIcon(act.type)}
                          <span className="font-bold text-sm text-gray-200">{act.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <Clock size={11} />
                          <span>{act.time}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{act.description}</p>
                      {act.location && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold">
                          <MapPin size={10} />
                          <span>{act.location}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Travel Tips */}
        {activeTab === "tips" && (
          <div className="space-y-3">
            {parsedData?.travelTips.map((tip, idx) => (
              <div key={idx} className="flex gap-3 p-4 bg-gray-900/30 border border-gray-800 rounded-xl items-start">
                <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-900 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black text-indigo-400">
                  {idx + 1}
                </span>
                <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
