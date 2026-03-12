import React from "react";
import Sidebar from "./Sidebar";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.root}>
      <input className="hidden" id="mobile-menu-toggle" type="checkbox" />

      <label
        className={`${styles.mobileOverlay} hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden`}
        htmlFor="mobile-menu-toggle"
      />

      <div className={`${styles.wrapper} flex h-screen overflow-hidden`}>

        <Sidebar activePage="dashboard" />

        <div className={`${styles.mainArea} flex-1 flex flex-col min-w-0 transition-all duration-300`}>
          <header className={`${styles.navBar} h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/10 text-white shrink-0`}>
            <div className="flex items-center gap-4">
              <label className="lg:hidden text-white cursor-pointer p-1 rounded hover:bg-white/10" htmlFor="mobile-menu-toggle">
                <span className="material-icons">menu</span>
              </label>
              <h1 className="text-xl font-semibold tracking-tight truncate">Operational Analytics</h1>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative p-1 text-white/80 hover:text-white transition-colors" type="button">
                <span className="material-icons">notifications</span>
                <span className={`absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 ${styles.navBar}`} />
              </button>

              <div className="flex items-center gap-3 border-l border-white/20 pl-6">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-white">Dr. Arul Kumaran</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Chief Administrator</p>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-400 border-2 border-primary/20 flex-shrink-0">
                  <img
                    alt="Admin Profile"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2Rexbnu_K_sy4YBAigcjaSCotM04G7qkV7MLp8vzG3k7nGV32dC6O0CS-AugyQ7CTNZfiE4F8rBrsqBJFSepbF_heNR-sj4z1rkbVtUvvj-0RYGNen2Ux632fXHUuAcVoy9DBbDTrDG2YVsI1Cl6i4APAekBtNifu2ZjUa1Yxpca5e_369V8zBVKThi3cpIyqVKxVgjU5N6jo7FGgnMQmG0eYP631QJETfZ48MUo4ruhKoZKjiZfrutAFHVsYK7-j6BaKVHVklB0"
                  />
                </div>
              </div>
            </div>
          </header>

          <main className={`${styles.mainBg} flex-1 overflow-y-auto dark:bg-background-dark/50 p-4 lg:p-8`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`bg-white dark:bg-zinc-900 p-6 rounded-lg ${styles.shadow} flex flex-col`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="material-icons text-primary bg-primary/10 p-2 rounded-lg">event_note</span>
                  <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded">+12%</span>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Bookings</h3>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">156</p>
              </div>

              <div className={`bg-white dark:bg-zinc-900 p-6 rounded-lg ${styles.shadow} flex flex-col`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="material-icons text-amber-500 bg-amber-500/10 p-2 rounded-lg">pending_actions</span>
                  <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded">Attention</span>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Requests</h3>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">23</p>
              </div>

              <div className={`bg-white dark:bg-zinc-900 p-6 rounded-lg ${styles.shadow} flex flex-col`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="material-icons text-emerald-500 bg-emerald-500/10 p-2 rounded-lg">meeting_room</span>
                  <span className="text-sm font-semibold text-emerald-600">8 / 15</span>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Available Venues</h3>
                <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "53.3%" }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 uppercase font-medium">53% Capacity Utilization</p>
              </div>

              <div className={`bg-white dark:bg-zinc-900 p-6 rounded-lg ${styles.shadow} flex flex-col relative overflow-hidden`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="material-icons text-blue-500 bg-blue-500/10 p-2 rounded-lg">verified</span>
                  <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
                      <circle
                        className="text-slate-100 dark:text-slate-800"
                        cx="20"
                        cy="20"
                        fill="transparent"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <circle
                        className="text-blue-500"
                        cx="20"
                        cy="20"
                        fill="transparent"
                        r="16"
                        stroke="currentColor"
                        strokeDasharray="100.5"
                        strokeDashoffset="6"
                        strokeWidth="4"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Approval Rate</h3>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">94%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
              <div className={`lg:col-span-3 bg-white dark:bg-zinc-900 p-6 rounded-lg ${styles.shadow}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Booking Trends</h3>
                  <select className="bg-slate-50 border-none rounded text-xs font-medium focus:ring-primary/50 cursor-pointer">
                    <option>Last 6 Months</option>
                    <option>This Year</option>
                  </select>
                </div>

                <div className="h-64 flex items-end justify-between gap-2 pt-4 relative">
                  <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between py-2 pointer-events-none">
                    <div className="border-t border-slate-100 dark:border-white/5 w-full" />
                    <div className="border-t border-slate-100 dark:border-white/5 w-full" />
                    <div className="border-t border-slate-100 dark:border-white/5 w-full" />
                    <div className="border-t border-slate-100 dark:border-white/5 w-full" />
                  </div>

                  <div className="flex-1 bg-primary/20 rounded-t-sm h-[40%] group relative">
                    <div className="absolute inset-x-0 bottom-0 bg-primary h-[80%] rounded-t-sm transition-all group-hover:bg-primary/80" />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold">JAN</span>
                  </div>
                  <div className="flex-1 bg-primary/20 rounded-t-sm h-[60%] group relative">
                    <div className="absolute inset-x-0 bottom-0 bg-primary h-[75%] rounded-t-sm transition-all group-hover:bg-primary/80" />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold">FEB</span>
                  </div>
                  <div className="flex-1 bg-primary/20 rounded-t-sm h-[55%] group relative">
                    <div className="absolute inset-x-0 bottom-0 bg-primary h-[85%] rounded-t-sm transition-all group-hover:bg-primary/80" />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold">MAR</span>
                  </div>
                  <div className="flex-1 bg-primary/20 rounded-t-sm h-[80%] group relative">
                    <div className="absolute inset-x-0 bottom-0 bg-primary h-[90%] rounded-t-sm transition-all group-hover:bg-primary/80" />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold">APR</span>
                  </div>
                  <div className="flex-1 bg-primary/20 rounded-t-sm h-[70%] group relative">
                    <div className="absolute inset-x-0 bottom-0 bg-primary h-[60%] rounded-t-sm transition-all group-hover:bg-primary/80" />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold">MAY</span>
                  </div>
                  <div className="flex-1 bg-primary/20 rounded-t-sm h-[90%] group relative">
                    <div className="absolute inset-x-0 bottom-0 bg-primary h-[85%] rounded-t-sm transition-all group-hover:bg-primary/80" />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold">JUN</span>
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-lg ${styles.shadow}`}>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Venue Usage</h3>
                <div className="flex flex-col h-full">
                  <div className="relative w-40 h-40 mx-auto mb-8">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" fill="transparent" r="16" stroke="#ff9500" strokeDasharray="100 100" strokeWidth="8" />
                      <circle cx="16" cy="16" fill="transparent" r="16" stroke="#FF7A59" strokeDasharray="65 100" strokeWidth="8" />
                      <circle cx="16" cy="16" fill="transparent" r="16" stroke="#ffc107" strokeDasharray="35 100" strokeWidth="8" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-full m-4">
                      <span className="text-2xl font-bold">15</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Venues</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-sm font-medium">Idea Lab</span>
                      </div>
                      <span className="text-sm font-bold">45%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-coral-custom" />
                        <span className="text-sm font-medium">Seminar Hall</span>
                      </div>
                      <span className="text-sm font-bold">30%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <span className="text-sm font-medium">Conference Room</span>
                      </div>
                      <span className="text-sm font-bold">25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`bg-white dark:bg-zinc-900 rounded-lg ${styles.shadow} overflow-hidden`}>
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Booking Requests</h3>
                  <button className="text-primary text-xs font-bold hover:underline" type="button">
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-zinc-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Requester</th>
                        <th className="px-6 py-3">Venue</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">RJ</div>
                            <span className="text-sm font-medium">Dr. Rajesh Jain</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Main Auditorium</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 24, 2023</td>
                        <td className="px-6 py-4">
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Approved</span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-xs">ST</div>
                            <span className="text-sm font-medium">Prof. S. Thara</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Idea Lab</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 25, 2023</td>
                        <td className="px-6 py-4">
                          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Pending</span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-bold text-xs">MA</div>
                            <span className="text-sm font-medium">M. Arunagiri</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Board Room</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 26, 2023</td>
                        <td className="px-6 py-4">
                          <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Rejected</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`bg-white dark:bg-zinc-900 p-6 rounded-lg ${styles.shadow} flex flex-col`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Upcoming - Next 7 Days</h3>
                  <span className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-500 px-2 py-1 rounded font-bold">Oct 24 - Oct 31</span>
                </div>

                <div className="relative flex-1 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-white/10">
                  <div className="relative pl-8 flex gap-4 items-start group">
                    <div className="absolute left-0 w-[24px] h-[24px] bg-white dark:bg-zinc-900 border-4 border-primary rounded-full z-10 transition-transform group-hover:scale-110" />
                    <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg flex-1 border border-slate-100 dark:border-white/5">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">IEEE Regional Meeting</p>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Tomorrow</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Conference Hall B • 09:00 AM - 01:00 PM</p>
                    </div>
                  </div>

                  <div className="relative pl-8 flex gap-4 items-start group">
                    <div className="absolute left-0 w-[24px] h-[24px] bg-white dark:bg-zinc-900 border-4 border-slate-200 dark:border-zinc-700 rounded-full z-10" />
                    <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg flex-1 border border-slate-100 dark:border-white/5">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">Hackathon 2023 Prelims</p>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Oct 26</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">IT Seminar Hall • 10:00 AM onwards</p>
                    </div>
                  </div>

                  <div className="relative pl-8 flex gap-4 items-start group">
                    <div className="absolute left-0 w-[24px] h-[24px] bg-white dark:bg-zinc-900 border-4 border-slate-200 dark:border-zinc-700 rounded-full z-10" />
                    <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg flex-1 border border-slate-100 dark:border-white/5">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">Alumni Guest Lecture</p>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Oct 28</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Main Seminar Hall • 02:30 PM - 04:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-navy-custom rounded-lg text-white gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <h4 className="font-bold">Real-time Operations</h4>
                  <p className="text-[10px] text-white/60">Quick access to essential admin utilities</p>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  className="flex-1 md:flex-none justify-center bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded font-semibold text-sm transition-colors flex items-center gap-2"
                  type="button"
                >
                  <span className="material-icons text-sm">visibility</span>
                  Check Live Availability
                </button>
                <button
                  className="flex-1 md:flex-none justify-center border border-white/20 hover:bg-white/10 text-white px-6 py-2 rounded font-semibold text-sm transition-all flex items-center gap-2"
                  type="button"
                >
                  <span className="material-icons text-sm">file_download</span>
                  Export Report
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
