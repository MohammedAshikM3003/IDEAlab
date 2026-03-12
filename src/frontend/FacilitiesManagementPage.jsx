import React from "react";

import Sidebar from "./Sidebar";
import styles from "./DashboardPage.module.css";

export default function FacilitiesManagementPage() {
  return (
    <div className={styles.root}>
      <input className="hidden" id="mobile-menu-toggle" type="checkbox" />

      <label
        className={`${styles.mobileOverlay} hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden`}
        htmlFor="mobile-menu-toggle"
      />

      <div className={`${styles.wrapper} flex h-screen overflow-hidden`}>
        <Sidebar activePage="facilities" />

        <div className={`${styles.mainArea} flex-1 flex flex-col min-w-0 transition-all duration-300`}>
          <header className={`${styles.navBar} h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/10 text-white shrink-0`}>
            <div className="flex items-center gap-4">
              <label className="lg:hidden text-white cursor-pointer p-1 rounded hover:bg-white/10" htmlFor="mobile-menu-toggle">
                <span className="material-icons">menu</span>
              </label>
              <h1 className="text-xl font-semibold tracking-tight truncate">Facilities Management</h1>
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
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAho1kbmQOpkvDnyZU_Lgn-YWoRmGAAP-hZ1v0DRNvZ_ShAdcZyIhVcGS0ypsCS7uS_4DMe85SCt6sXZTz6emzbHTpK-ruonkMEmzAonpcJU2_siCBRT7qZOMfpHnn26CJPWMTJfUjnZuTrmQleTqMcc8ZZxatGdrDoLU0GddmXrZW5vLap318y0dP9VnmKKBsYhfOadGx8omkAK0n6F2qH-2nO12QLsZbuU7Yv1EE79M_Ir1eKLrEH7H97IRyFOadxp_lybLo8ZoI"
                  />
                </div>
              </div>
            </div>
          </header>

          <main className={`${styles.mainBg} flex-1 overflow-y-auto dark:bg-background-dark/50 p-4 lg:p-8`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`bg-white dark:bg-zinc-900 p-6 rounded-lg ${styles.shadow} flex flex-col justify-between h-36`}>
                <div className="flex justify-between items-start">
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-full">
                    <span className="material-icons text-primary">apartment</span>
                  </div>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold px-2 py-1 rounded">+2</span>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Facilities</p>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">15</h3>
                </div>
              </div>

              <div className={`bg-white dark:bg-zinc-900 p-6 rounded-lg ${styles.shadow} flex flex-col justify-between h-36`}>
                <div className="flex justify-between items-start">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
                    <span className="material-icons text-blue-500">verified</span>
                  </div>
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded">Attention</span>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Active Now</p>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">12</h3>
                </div>
              </div>

              <div className={`bg-white dark:bg-zinc-900 p-6 rounded-lg ${styles.shadow} flex flex-col justify-between h-36`}>
                <div className="flex justify-between items-start">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-full">
                    <span className="material-icons text-green-500">door_sliding</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">12 / 15</span>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Capacity Utilization</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "78%" }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">78% Occupancy Rate</p>
                </div>
              </div>

              <div className={`bg-white dark:bg-zinc-900 p-6 rounded-lg ${styles.shadow} flex flex-col justify-between h-36`}>
                <div className="flex justify-between items-start">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-full">
                    <span className="material-icons text-indigo-500">inventory_2</span>
                  </div>
                  <div className="relative w-10 h-10">
                    <svg className="transform -rotate-90 w-10 h-10" viewBox="0 0 40 40">
                      <circle
                        className="text-gray-200 dark:text-gray-700"
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
                        strokeDasharray="100"
                        strokeDashoffset="53"
                        strokeWidth="4"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Equipment Status</p>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                    47<span className="text-lg font-normal text-slate-400 ml-1">Items</span>
                  </h3>
                </div>
              </div>
            </div>

          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className={`w-full lg:w-3/5 bg-white dark:bg-zinc-900 rounded-lg ${styles.shadow} p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Facility Overview</h3>
                <button className="text-sm text-primary hover:text-orange-600 font-medium" type="button">
                  View All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
                    <img
                      alt="Idea Lab"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKe8XC4f8NYr6XLZEJuTQ4T8aTSnvIE2nmJlDWmYRJXTBTd2csfBpYFRhGePKi8_a_KETh4JZ98JviL9o-YV-zFUdX3qnvdnaveznh_x6kTEsa65Yer-P-yS6W10QnF5hE1_6M6239ww3iYRX6LWpvIpoHCkTosooZJ3LAWsmJM6F7xq0XzBAqil2XzQRLS9g4SuEtdAaznISteudX8rJwJzS0_01MJZCKF0MbBHiy9bt2sGGWEWUAj9lMtqjT2Fmn7OOS4jEC_aM"
                    />
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">Active</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-1">AICTE Idea Lab</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Ground Floor, Block A</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <span className="material-icons text-base mr-1">groups</span>
                        <span>45/60</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <span className="material-icons text-base mr-1">wifi</span>
                        <span className="text-green-500">Good</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
                    <img
                      alt="Seminar Hall"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2v_7M0itnps2kVbgugpSEnLEd5uyQU4GiBbonvwNHdqxslFtw7P4m6xR5AIMWPHQ_zhUDtQkgTI0cy8rfavn0MOuInZb2TNsl7IxvsY3LsgIi1xYzMmmO0oChm0_H78hn08FnjT-Jd5WTnkfma_i8m03cR_i4IfHJNgrILNCtl4xNgCZdK4hy9aovEO4B0nnhsDQgLAyFzQzvo4N2n-ywPXi40GOvU6TtxVv4Zba8S7ewKfkYlbQBxaEXcMpRQf7aLO0ohQUnnjA"
                    />
                    <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">Cleaning</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-1">Main Seminar Hall</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">First Floor, Admin Block</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <span className="material-icons text-base mr-1">groups</span>
                        <span>0/250</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <span className="material-icons text-base mr-1">ac_unit</span>
                        <span>On</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
                    <img
                      alt="Meeting Room"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB25Qiv52e1m10K3-72nMnyYvmeEUi22FU1ql2TeABLz09uIyL_tMYH7JaUlcMF6qj9bj5E3DDXzRi_vZ231DweMi1e4O749SMCXLAmoxzpGTYDXnqeip70xe2H5wcJFBST1goN-h51NsA9SM0qCXgYyDcebz7VqNoQcjXq3vPdjrW3gsd5qgUREHA1JgeDKqb21l9huoPYwigpUFB1EYA45pyJ8nmnJUqnYR_nHcYydZjxg0KoxnMMqW00VMeC4Baq82yGckyWG50"
                    />
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">Active</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-1">Board Meeting Room</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Second Floor, East Wing</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <span className="material-icons text-base mr-1">groups</span>
                        <span>12/15</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <span className="material-icons text-base mr-1">tv</span>
                        <span>Avail</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
                    <img
                      alt="Conference Room"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuATVU30fHz2IM0XBtfqyXoej2Lp_Oon_ltWHoQfF7G5GA2G7JYzCoByVk3Ei6k0fdKKJSroqi0d7KdVqP-dZdh1PNaLaenv_aASeGXeIK1rCH1kpR3yxCtYhcAqCIiU8OroU73fLVPrKbfrSrgYaEMjX-4Eo2U32G0tAv0ohZh0vEbldPJORI8HHxgmuoBxMCZfync74YfAQnwyjhAOD8s5zCAyf89NUJotm58op8fydhDsoEqDFL5Tbukk3DOpY7XHS1jt3vW8VDc"
                    />
                    <span className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded shadow-sm">Reserved</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-1">Conference Room B</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Third Floor, West Wing</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <span className="material-icons text-base mr-1">groups</span>
                        <span>--/30</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <span className="material-icons text-base mr-1">videocam</span>
                        <span>Setup</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`w-full lg:w-2/5 bg-white dark:bg-zinc-900 rounded-lg ${styles.shadow} p-6 flex flex-col`}>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Equipment Distribution</h3>
              <div className="flex-1 flex flex-col justify-center items-center relative">
                <div className="w-64 h-64 rounded-full border-[24px] border-gray-100 dark:border-gray-800 relative flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "conic-gradient(#FF9400 0% 40%, #FF7A59 40% 65%, #3B82F6 65% 85%, #F3F4F6 85% 100%)",
                      WebkitMask: "radial-gradient(transparent 58%, black 59%)",
                      mask: "radial-gradient(transparent 58%, black 59%)",
                    }}
                  />
                  <div className="text-center z-10">
                    <h2 className="text-4xl font-bold text-gray-800 dark:text-white">47</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Total Items</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-default">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mr-3" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Projectors &amp; Screens</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">40%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-default">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-coral-custom mr-3" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Audio Systems</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">25%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-default">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-3" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Network Equipment</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">20%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-default">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Others</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">15%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
            <div className={`bg-white dark:bg-zinc-900 rounded-lg ${styles.shadow} p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Facility Updates</h3>
                <button className="text-gray-400 hover:text-primary" type="button">
                  <span className="material-icons text-slate-400 hover:text-primary">more_horiz</span>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="material-icons text-blue-500 text-sm">build</span>
                  </div>
                  <div className="flex-1 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex justify-between mb-1">
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-white">AC Maintenance Completed</h5>
                      <span className="text-xs text-gray-400">2h ago</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Seminar Hall cooling system serviced and filters replaced.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="material-icons text-primary text-sm">event_available</span>
                  </div>
                  <div className="flex-1 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex justify-between mb-1">
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-white">New Booking Request</h5>
                      <span className="text-xs text-gray-400">4h ago</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dr. Smith requested Idea Lab for "Innovation Workshop" on Oct 25.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="material-icons text-green-500 text-sm">check_circle</span>
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex justify-between mb-1">
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-white">Cleaning Verified</h5>
                      <span className="text-xs text-gray-400">6h ago</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Housekeeping staff marked "Conference Room B" as ready.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`bg-white dark:bg-zinc-900 rounded-lg ${styles.shadow} p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Upcoming Maintenance</h3>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">Next 7 Days</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-2 text-center mr-4 min-w-[50px]">
                      <span className="block text-xs text-red-500 font-bold uppercase">Oct</span>
                      <span className="block text-lg font-bold text-gray-800 dark:text-white">24</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-white">Projector Calibration</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Room 304, IT Block</p>
                    </div>
                  </div>
                  <button
                    className="text-xs font-medium text-blue-500 hover:text-blue-700 border border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded transition-colors"
                    type="button"
                  >
                    Reschedule
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-2 text-center mr-4 min-w-[50px]">
                      <span className="block text-xs text-red-500 font-bold uppercase">Oct</span>
                      <span className="block text-lg font-bold text-gray-800 dark:text-white">26</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-white">Audio System Check</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Auditorium Main Stage</p>
                    </div>
                  </div>
                  <button
                    className="text-xs font-medium text-blue-500 hover:text-blue-700 border border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded transition-colors"
                    type="button"
                  >
                    Reschedule
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-2 text-center mr-4 min-w-[50px]">
                      <span className="block text-xs text-red-500 font-bold uppercase">Oct</span>
                      <span className="block text-lg font-bold text-gray-800 dark:text-white">28</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-white">Network Maintenance</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Campus Wide (11 PM - 2 AM)</p>
                    </div>
                  </div>
                  <button
                    className="text-xs font-medium text-blue-500 hover:text-blue-700 border border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded transition-colors"
                    type="button"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-8 z-50">
            <button
              className="bg-primary hover:bg-orange-600 text-white h-14 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition-transform transform hover:scale-105"
              type="button"
            >
              <span className="material-icons text-2xl">add</span>
              <span className="font-bold">Add Facility</span>
            </button>
          </div>
        </main>
      </div>
    </div>
    </div>
  );
}
