/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { UseAuth } from "../context/AuthContext";
import api from "../api/axios";
import { 
  LogOut, FileText, Calendar, MapPin, Sparkles, 
  Trash2, Download, Compass, BookOpen, Clock, 
  AlertCircle, Loader2, Plane, Hotel, Utensils, Car, Link
} from 'lucide-react';

export default function Dashboard() {
  const { logout, user } = UseAuth();
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [itineraries, setItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  const loadingMessages = [
    "Reading your documents...",
    "Extracting ticket information...",
    "Designing your day-by-day travel plan...",
    "Compiling your custom PDF itinerary..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchItineraries = async () => {
    try {
      const response = await api.get("/itinerary");
      if (response.data && response.data.success) {
        setItineraries(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching itineraries:", error);
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, []);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleGenerate = async () => {
    if (!title || files.length === 0) {
      alert("Please enter a journey title and upload at least one document file");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("journeyTitle", title);

      const response = await api.post("/itinerary", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true
      });

      if (response.data && response.data.success) {
        alert("Itinerary generated successfully!");
        setTitle("");
        setFiles([]);
        fetchItineraries();
        setSelectedItinerary(response.data.data);
        setActiveTab("overview");
      }
    } catch (error) {
      console.error("Itinerary generation error:", error);
      alert(error.response?.data?.message || "Failed to generate itinerary. Please verify your document formats.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this itinerary?")) return;

    try {
      await api.delete(`/itinerary/${id}`);
      fetchItineraries();
      if (selectedItinerary && selectedItinerary._id === id) {
        setSelectedItinerary(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete itinerary");
    }
  };

  const getParsedData = (itinerary) => {
    if (!itinerary) return null;
    try {
      return JSON.parse(itinerary.itineraryData);
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'flight':
        return <Plane className="text-red-400" size={18} />;
      case 'hotel':
        return <Hotel className="text-amber-400" size={18} />;
      case 'dining':
        return <Utensils className="text-emerald-400" size={18} />;
      case 'sightseeing':
        return <Compass className="text-cyan-400" size={18} />;
      case 'transit':
        return <Car className="text-gray-400" size={18} />;
      default:
        return <Calendar className="text-indigo-400" size={18} />;
    }
  };

  const parsedItinerary = getParsedData(selectedItinerary);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-gray-950/70 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="text-indigo-500 animate-pulse" size={24} />
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            AI Travel Itinerary
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:inline-block">
            Logged in as <strong className="text-gray-200">{user?.email}</strong>
          </span>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20 text-sm transition"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Create Itinerary & Past Lists */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Create Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <PlusIcon className="text-indigo-400" />
              Plan New Journey
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Journey Title
                </label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Europe Summer Trip, Paris getaway..." 
                  className="w-full px-4 py-2.5 bg-gray-900/60 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Upload Tickets & Booking Files
                </label>
                <div className="relative border border-dashed border-gray-700 hover:border-indigo-500 rounded-lg p-6 bg-gray-900/20 hover:bg-indigo-950/5 transition cursor-pointer flex flex-col items-center justify-center">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={loading}
                  />
                  <FileText className="text-gray-400 mb-2" size={32} />
                  <p className="text-sm font-medium text-gray-300 text-center">
                    Click to browse files
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    Supports PDFs and images (Max 5 files)
                  </p>
                </div>

                {/* Selected Files List */}
                {files.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-900/50 border border-gray-800 rounded-lg space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Selected Files ({files.length}):
                    </p>
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/20 p-1.5 rounded border border-indigo-900/30 overflow-hidden">
                        {file.type.includes('pdf') ? <FileText size={14} /> : <ImageIcon size={14} />}
                        <span className="truncate flex-1">{file.name}</span>
                        <span className="text-gray-500">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99] text-white font-medium py-3 rounded-lg shadow-lg shadow-indigo-600/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Generate Journey</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Past Journeys List */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl flex-1 flex flex-col">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <BookOpen className="text-indigo-400" size={18} />
              Saved Journeys
            </h2>
            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1 flex-1">
              {itineraries.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-800 rounded-lg">
                  <Calendar className="mx-auto mb-2 opacity-50" size={24} />
                  <p className="text-sm">No itineraries saved yet.</p>
                </div>
              ) : (
                itineraries.map((it) => (
                  <div 
                    key={it._id} 
                    onClick={() => { setSelectedItinerary(it); setActiveTab("overview"); }}
                    className={`p-4 border rounded-xl cursor-pointer transition flex items-center justify-between gap-4 ${
                      selectedItinerary?._id === it._id 
                        ? "bg-indigo-950/40 border-indigo-500/80 shadow-md" 
                        : "bg-gray-900/30 border-gray-800 hover:border-gray-700 hover:bg-gray-900/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{it.title}</h3>
                      <p className="text-xs text-indigo-400 truncate font-semibold mt-0.5">
                        {getParsedData(it)?.destination || "Plan details"}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {new Date(it.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a 
                        href={it.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg border border-gray-700 transition"
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </a>
                      <button 
                        onClick={(e) => handleDelete(it._id, e)}
                        className="p-1.5 bg-red-950/30 hover:bg-red-950/60 text-red-400 rounded-lg border border-red-900/30 transition"
                        title="Delete Itinerary"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right Side: Detailed Viewer */}
        <section className="lg:col-span-8">
          
          {loading ? (
            /* Loading Overlay Screen */
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 shadow-xl backdrop-blur-xl h-full min-h-[500px] flex flex-col items-center justify-center text-center">
              <Loader2 className="animate-spin text-indigo-500 mb-6" size={64} />
              <h3 className="text-xl font-bold text-white animate-pulse">
                Creating Your Travel Itinerary
              </h3>
              <p className="text-gray-400 text-sm mt-2 max-w-sm">
                Our AI travel agent is parsing your booking documents. This may take up to a minute...
              </p>
              
              {/* Cycling dynamic messages */}
              <div className="mt-8 px-4 py-2.5 bg-indigo-950/20 border border-indigo-800/30 text-indigo-300 rounded-full text-xs font-semibold tracking-wide flex items-center gap-2">
                <Sparkles size={14} className="animate-spin" />
                {loadingMessages[loadingStep]}
              </div>
            </div>
          ) : selectedItinerary && parsedItinerary ? (
            /* Detailed Itinerary View */
            <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl h-full flex flex-col overflow-hidden">
              
              {/* View Header */}
              <div className="p-6 border-b border-gray-800 bg-gray-950/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                    Travel Itinerary Plan
                  </span>
                  <h2 className="text-2xl font-black text-white mt-1">
                    {parsedItinerary.title}
                  </h2>
                  <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                    <MapPin size={14} className="text-red-400" />
                    <span>{parsedItinerary.destination}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {/* Copy Share Link */}
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/itinerary/share/${selectedItinerary._id}`;
                      navigator.clipboard.writeText(url);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm border transition ${
                      copied
                        ? 'bg-emerald-600/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Link size={15} />
                    {copied ? 'Link Copied!' : 'Copy Share Link'}
                  </button>

                  {/* Download PDF */}
                  <a 
                    href={selectedItinerary.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg shadow-indigo-600/25 transition text-sm"
                  >
                    <Download size={16} />
                    Download PDF
                  </a>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-800 px-6 bg-gray-950/10">
                <button 
                  onClick={() => setActiveTab("overview")}
                  className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === "overview" 
                      ? "border-indigo-500 text-indigo-400" 
                      : "border-transparent text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Compass size={16} />
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab("timeline")}
                  className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === "timeline" 
                      ? "border-indigo-500 text-indigo-400" 
                      : "border-transparent text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Calendar size={16} />
                  Timeline Plan
                </button>
                <button 
                  onClick={() => setActiveTab("tips")}
                  className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === "tips" 
                      ? "border-indigo-500 text-indigo-400" 
                      : "border-transparent text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <AlertCircle size={16} />
                  Travel Tips
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="p-6 overflow-y-auto max-h-[550px] flex-1">
                
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div className="p-4 bg-indigo-950/10 border border-indigo-900/30 rounded-xl">
                      <h4 className="text-sm font-bold text-indigo-300 mb-2 uppercase tracking-wide">
                        Journey Overview
                      </h4>
                      <p className="text-gray-300 leading-relaxed text-sm">
                        {parsedItinerary.overview}
                      </p>
                    </div>

                    {selectedItinerary.uploads && selectedItinerary.uploads.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-300 mb-2">
                          Source Files Used
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedItinerary.uploads[0]?.fileName?.map((name, idx) => (
                            <a 
                              key={idx}
                              href={selectedItinerary.uploads[0]?.fileUrl[idx]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-gray-900/40 border border-gray-800 hover:border-gray-700 rounded-lg text-xs text-gray-400 hover:text-indigo-400 transition"
                            >
                              <FileText size={14} />
                              <span className="truncate flex-1">{name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "timeline" && (
                  <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-800">
                    {parsedItinerary.days.map((day) => (
                      <div key={day.dayNumber} className="relative pl-10 space-y-4">
                        {/* Day Marker */}
                        <div className="absolute left-[-2px] top-1 w-9 h-9 rounded-full bg-indigo-950 border-2 border-indigo-500 flex items-center justify-center shadow-lg">
                          <span className="text-xs font-black text-indigo-400">{day.dayNumber}</span>
                        </div>

                        {/* Day Title */}
                        <div>
                          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                            {day.theme}
                          </h3>
                          {day.date && <p className="text-xs text-gray-500">{day.date}</p>}
                        </div>

                        {/* Activities */}
                        <div className="space-y-3">
                          {day.activities.map((act, actIdx) => (
                            <div 
                              key={actIdx} 
                              className="p-4 bg-gray-900/30 border border-gray-800 rounded-xl space-y-2 hover:border-gray-700 transition"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {getActivityIcon(act.type)}
                                  <span className="font-bold text-sm text-gray-200">
                                    {act.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                  <Clock size={12} />
                                  <span>{act.time}</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {act.description}
                              </p>
                              {act.location && (
                                <div className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold mt-1">
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

                {activeTab === "tips" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">
                      Local Travel Guidelines
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {parsedItinerary.travelTips.map((tip, idx) => (
                        <div key={idx} className="flex gap-3 p-4 bg-gray-900/30 border border-gray-800 rounded-xl items-start">
                          <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-900 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black text-indigo-400">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {tip}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* Placeholder Screen */
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 shadow-xl backdrop-blur-xl h-full min-h-[500px] flex flex-col items-center justify-center text-center text-gray-500">
              <Compass className="text-gray-600 mb-4 animate-bounce" size={48} />
              <h3 className="text-lg font-bold text-gray-300">No Journey Selected</h3>
              <p className="text-sm max-w-sm mt-1">
                Select a trip from the list, or enter a title and upload documents to plan a new journey!
              </p>
            </div>
          )}

        </section>

      </main>
    </div>
  );
}

// Inline Subcomponents to avoid dependency/import issues
function PlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function ImageIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}