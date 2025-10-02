import React, { useState, useEffect, useRef } from 'react';
import { Play, Settings, BarChart3, Pause, SkipForward, ZoomIn, ZoomOut, ChevronDown, ChevronUp, Eye, X, Info, GitCompare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';

const OrdersListModal = ({ isOpen, onClose, orders }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">Generated Orders</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-3">Order ID</th>
                <th scope="col" className="px-4 py-3">Branch</th>
                <th scope="col" className="px-4 py-3 text-center">Total Lines</th>
                <th scope="col" className="px-4 py-3 text-center">O1/O2 Lines</th>
                <th scope="col" className="px-4 py-3 text-center">P1 Lines</th>
                <th scope="col" className="px-4 py-3">Zones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">Order #{order.id}</td>
                  <td className="px-4 py-3">{order.branch}</td>
                  <td className="px-4 py-3 text-center">{order.lines.length}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                      {order.o1o2Lines.length}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                      {order.p1Lines.length}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {order.o1o2Lines.length > 0 && <span className="bg-blue-50 px-2 py-1 rounded mr-1">O1/O2</span>}
                    {order.p1Lines.length > 0 && <span className="bg-green-50 px-2 py-1 rounded">P1</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total: {orders.length} orders | {orders.reduce((sum, o) => sum + o.lines.length, 0)} items
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children || <Info size={14} className="text-blue-500" />}
      </div>
      {show && (
        <div className="absolute z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl -top-2 left-6">
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-3"></div>
          {text}
        </div>
      )}
    </div>
  );
};

const PickerActivityView = ({ isOpen, onClose, picker, animationData, currentTime, pickerColor }) => {
  if (!isOpen || !picker || !animationData) return null;

  const pickEvents = animationData.events.filter(e => e.type === 'pick_item' && e.picker === picker.index);

  const currentPickEventIndex = pickEvents.findIndex(e => e.time >= currentTime);
  
  let previousLine = null;
  let currentLine = null;
  let nextLine = null;

  if (currentPickEventIndex === -1) {
    // All picks are done for this picker
    previousLine = pickEvents[pickEvents.length - 1];
  } else {
    const lastPickTime = currentPickEventIndex > 0 ? pickEvents[currentPickEventIndex - 1].time : -1;
    const isCurrentlyPicking = picker.status === 'picking' && currentTime > lastPickTime;

    if (isCurrentlyPicking) {
        previousLine = pickEvents[currentPickEventIndex - 2];
        currentLine = pickEvents[currentPickEventIndex - 1];
        nextLine = pickEvents[currentPickEventIndex];
    } else {
        previousLine = pickEvents[currentPickEventIndex - 1];
        currentLine = pickEvents[currentPickEventIndex];
        nextLine = pickEvents[currentPickEventIndex + 1];
    }
  }


  const renderLine = (line, label) => {
    if (!line) return (
      <div className="flex items-center">
        <span className="font-bold w-20">{label}:</span>
        <span className="text-gray-500">N/A</span>
      </div>
    );
    return (
      <div className="flex items-center">
        <span className="font-bold w-20">{label}:</span>
        <span className="font-mono bg-gray-200 px-2 py-1 rounded-md text-sm">{line.fullLocation}</span>
        <span className="text-xs text-gray-500 ml-2">({line.equipment.replace('_', ' ')})</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b" style={{ backgroundColor: pickerColor, color: 'white' }}>
          <h3 className="text-xl font-bold">{picker.name}'s Activity</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-lg"><strong>Status:</strong> <span className="font-medium">{picker.status}</span></div>
          {picker.currentOrder && <div className="text-sm"><strong>Order:</strong> <span className="font-medium">{picker.currentOrder}</span></div>}
          <div className="border-t pt-4 mt-4 space-y-3">
            {renderLine(previousLine, 'Previous')}
            {renderLine(currentLine, 'Current')}
            {renderLine(nextLine, 'Next')}
          </div>
        </div>
      </div>
    </div>
  );
};


const ComparisonResults = ({ zoneData, equipmentData, pickerNames, onClose }) => {
  if (!zoneData || !equipmentData) return null;

  // Build order assignments from animation data
  const zoneOrderAssignments = [];
  const equipOrderAssignments = [];
  
  zoneData.events.filter(e => e.type === 'start_order').forEach(event => {
    const pickerName = pickerNames[event.picker];
    const existingAssignment = zoneOrderAssignments.find(a => a.orderId === event.order);
    if (!existingAssignment) {
      zoneOrderAssignments.push({
        orderId: event.order,
        picker: pickerName,
        branch: event.branch,
        type: event.order.includes('O1O2') ? 'O1/O2' : event.order.includes('P1') ? 'P1' : 'Full'
      });
    }
  });
  
  equipmentData.events.filter(e => e.type === 'start_order').forEach(event => {
    const pickerName = pickerNames[event.picker];
    const existingAssignment = equipOrderAssignments.find(a => a.orderId === event.order);
    if (!existingAssignment) {
      equipOrderAssignments.push({
        orderId: event.order,
        picker: pickerName,
        branch: event.branch,
        type: 'Full'
      });
    }
  });

  const metrics = [
    {
      name: 'Total Time',
      zone: (zoneData.totalTime / 60).toFixed(1),
      equipment: (equipmentData.totalTime / 60).toFixed(1),
      unit: 'min',
      winner: zoneData.totalTime < equipmentData.totalTime ? 'zone' : 'equipment',
      tooltip: 'Total time from first pick to last pallet wrapped'
    },
    {
      name: 'Productivity',
      zone: (zoneData.totalItems / (zoneData.totalTime / 60)).toFixed(1),
      equipment: (equipmentData.totalItems / (equipmentData.totalTime / 60)).toFixed(1),
      unit: 'items/min',
      winner: (zoneData.totalItems / zoneData.totalTime) > (equipmentData.totalItems / equipmentData.totalTime) ? 'zone' : 'equipment',
      tooltip: 'Total items picked divided by total time'
    },
    {
      name: 'Wait Time',
      zone: (zoneData.totalWaitTime / 60).toFixed(1),
      equipment: (equipmentData.totalWaitTime / 60).toFixed(1),
      unit: 'min',
      winner: zoneData.totalWaitTime < equipmentData.totalWaitTime ? 'zone' : 'equipment',
      tooltip: 'Total time pickers spent waiting for equipment or wrappers'
    },
    {
      name: 'Equipment Waits',
      zone: zoneData.equipmentWaitEvents || 0,
      equipment: equipmentData.equipmentWaitEvents || 0,
      unit: 'events',
      winner: (zoneData.equipmentWaitEvents || 0) < (equipmentData.equipmentWaitEvents || 0) ? 'zone' : 'equipment',
      tooltip: 'Number of times pickers had to wait for forklifts or order pickers'
    },
    {
      name: 'Wrapper Waits',
      zone: zoneData.wrapperWaitEvents || 0,
      equipment: equipmentData.wrapperWaitEvents || 0,
      unit: 'events',
      winner: (zoneData.wrapperWaitEvents || 0) < (equipmentData.wrapperWaitEvents || 0) ? 'zone' : 'equipment',
      tooltip: 'Number of times pickers had to wait for pallet wrappers'
    },
  ];

  const pickerComparison = zoneData.finalPickerStats.map((zonePicker, idx) => ({
    name: zonePicker.name,
    zoneOrders: zonePicker.ordersCompleted,
    equipmentOrders: equipmentData.finalPickerStats[idx].ordersCompleted,
    zoneItems: zonePicker.itemsPicked,
    equipmentItems: equipmentData.finalPickerStats[idx].itemsPicked,
  }));

  const timeDiff = Math.abs(zoneData.totalTime - equipmentData.totalTime);
  const winner = zoneData.totalTime < equipmentData.totalTime ? 'Zone-Based' : 'Equipment-Based';
  const loser = winner === 'Zone-Based' ? 'Equipment-Based' : 'Zone-Based';
  const percentFaster = ((timeDiff / Math.max(zoneData.totalTime, equipmentData.totalTime)) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex justify-between items-center p-6 border-b z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Strategy Comparison Results</h2>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-bold text-green-600">{winner}</span> completed {percentFaster}% faster than {loser}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics Comparison */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-4">
              Performance Metrics
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((metric, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{metric.name}</span>
                    <Tooltip text={metric.tooltip} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2 rounded ${metric.winner === 'zone' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
                      <div className="text-xs text-gray-600">Zone</div>
                      <div className="text-lg font-bold">{metric.zone}</div>
                      <div className="text-xs text-gray-500">{metric.unit}</div>
                    </div>
                    <div className={`p-2 rounded ${metric.winner === 'equipment' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
                      <div className="text-xs text-gray-600">Equipment</div>
                      <div className="text-lg font-bold">{metric.equipment}</div>
                      <div className="text-xs text-gray-500">{metric.unit}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Picker Performance Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">
              Picker Performance Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={pickerComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="zoneOrders" fill="#3b82f6" name="Zone Orders" />
                <Bar dataKey="equipmentOrders" fill="#8b5cf6" name="Equipment Orders" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          {/* Order Assignments Tables */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Order Assignments - Zone-Based</h3>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Assigned Picker</th>
                    <th className="px-4 py-3">Branch</th>
                    <th className="px-4 py-3">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {zoneOrderAssignments.map((assignment, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{assignment.orderId}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-blue-600">{assignment.picker}</span>
                      </td>
                      <td className="px-4 py-3">{assignment.branch}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          assignment.type === 'O1/O2' ? 'bg-blue-100 text-blue-800' :
                          assignment.type === 'P1' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {assignment.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Order Assignments - Equipment-Based</h3>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Assigned Picker</th>
                    <th className="px-4 py-3">Branch</th>
                    <th className="px-4 py-3">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {equipOrderAssignments.map((assignment, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">Order {assignment.orderId}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-purple-600">{assignment.picker}</span>
                      </td>
                      <td className="px-4 py-3">{assignment.branch}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                          {assignment.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Picker Stats Table */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Detailed Picker Statistics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-4 py-3">Picker</th>
                    <th className="px-4 py-3 text-center">Strategy</th>
                    <th className="px-4 py-3 text-center">Orders</th>
                    <th className="px-4 py-3 text-center">Items</th>
                    <th className="px-4 py-3 text-center">Walk Picks</th>
                    <th className="px-4 py-3 text-center">OP Picks</th>
                    <th className="px-4 py-3 text-center">FL Picks</th>
                  </tr>
                </thead>
                <tbody>
                  {zoneData.finalPickerStats.map((stats, idx) => (
                    <React.Fragment key={idx}>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium" rowSpan="2">{stats.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Zone</span>
                        </td>
                        <td className="px-4 py-3 text-center">{stats.ordersCompleted}</td>
                        <td className="px-4 py-3 text-center">{stats.itemsPicked}</td>
                        <td className="px-4 py-3 text-center">{stats.equipmentUsage.walk}</td>
                        <td className="px-4 py-3 text-center">{stats.equipmentUsage.order_picker}</td>
                        <td className="px-4 py-3 text-center">{stats.equipmentUsage.forklift}</td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-center">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Equipment</span>
                        </td>
                        <td className="px-4 py-3 text-center">{equipmentData.finalPickerStats[idx].ordersCompleted}</td>
                        <td className="px-4 py-3 text-center">{equipmentData.finalPickerStats[idx].itemsPicked}</td>
                        <td className="px-4 py-3 text-center">{equipmentData.finalPickerStats[idx].equipmentUsage.walk}</td>
                        <td className="px-4 py-3 text-center">{equipmentData.finalPickerStats[idx].equipmentUsage.order_picker}</td>
                        <td className="px-4 py-3 text-center">{equipmentData.finalPickerStats[idx].equipmentUsage.forklift}</td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analysis */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-300">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              📊 Analysis
            </h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <strong>🏆 Winner: {winner}</strong>
                <p className="text-gray-600 mt-1">
                  This strategy completed all orders {percentFaster}% faster ({(timeDiff / 60).toFixed(1)} minutes saved)
                </p>
              </div>
              
              {zoneData.totalWaitTime < equipmentData.totalWaitTime ? (
                <div className="bg-white p-3 rounded-lg">
                  <strong>⏱️ Reduced Wait Times</strong>
                  <p className="text-gray-600 mt-1">
                    Zone-based reduced wait time by {((equipmentData.totalWaitTime - zoneData.totalWaitTime) / 60).toFixed(1)} minutes
                    by allowing pickers to skip items requiring busy equipment.
                  </p>
                </div>
              ) : (
                <div className="bg-white p-3 rounded-lg">
                  <strong>🚀 Better Equipment Utilization</strong>
                  <p className="text-gray-600 mt-1">
                    Equipment-based method reduced equipment changes, saving {((zoneData.totalWaitTime - equipmentData.totalWaitTime) / 60).toFixed(1)} minutes.
                  </p>
                </div>
              )}
              
              <div className="bg-white p-3 rounded-lg">
                <strong>💡 Key Insight</strong>
                <p className="text-gray-600 mt-1">
                  {winner === 'Zone-Based' 
                    ? 'The zone-based strategy appears more efficient when equipment availability is a constraint, as it reduces picker wait times.'
                    : 'The equipment-based strategy appears more efficient when the time to change equipment is significant, as it minimizes non-picking-related travel and transitions.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 p-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const SimulationView = ({ 
  animationData, 
  currentTime, 
  pickerStates, 
  stagedPallets, 
  pickerPaths, 
  zoom, 
  spectateMode,
  showLegend,
  title,
  config,
  pickerConfigs,
  pickerColors,
  pickerNames,
  onPickerClick
}) => {
  const aisleStructure = {
    W1: { zone: 'O1', sides: 2, width: 16, height: 21, opHeight: 6, x: 3, y: 1, length: 16, color: '#3b82f6' },
    W2: { zone: 'O1', sides: 2, width: 16, height: 21, opHeight: 6, x: 3, y: 2.8, length: 16, color: '#3b82f6' },
    W3: { zone: 'O1', sides: 2, width: 16, height: 21, opHeight: 6, x: 3, y: 4.6, length: 16, color: '#3b82f6' },
    W4: { zone: 'O2', sides: 2, width: 16, height: 21, opHeight: 6, x: 3, y: 6.4, length: 16, color: '#8b5cf6' },
    W5: { zone: 'O2', sides: 2, width: 16, height: 21, opHeight: 6, x: 3, y: 8.2, length: 16, color: '#8b5cf6' },
    W6: { zone: 'P1', sides: 1, width: 21, height: 7, opHeight: 4, x: 3, y: 10.0, length: 21, color: '#10b981' },
    W7: { zone: 'P1', sides: 2, width: 21, height: 5, opHeight: 2, x: 3, y: 12.1, length: 21, color: '#10b981' },
    W8: { zone: 'P1', sides: 2, width: 21, height: 5, opHeight: 2, x: 3, y: 14.2, length: 21, color: '#10b981' },
    W9: { zone: 'P1', sides: 2, width: 21, height: 5, opHeight: 2, x: 3, y: 16.3, length: 21, color: '#10b981' },
    W10: { zone: 'P1', sides: 2, width: 21, height: 5, opHeight: 2, x: 3, y: 18.4, length: 21, color: '#10b981' },
    W11: { zone: 'P1', sides: 2, width: 21, height: 5, opHeight: 2, x: 3, y: 20.5, length: 21, color: '#10b981' },
    W12: { zone: 'P1', sides: 1, width: 21, height: 7, opHeight: 4, x: 3, y: 22.6, length: 21, color: '#10b981' },
    B4: { zone: 'P1', sides: 1, width: 4, height: 1, opHeight: 999, x: 3, y: 24.7, length: 4, color: '#f59e0b' },
    B3: { zone: 'P1', sides: 1, width: 4, height: 1, opHeight: 999, x: 3, y: 25.2, length: 4, color: '#f59e0b' },
    B2: { zone: 'P1', sides: 1, width: 4, height: 1, opHeight: 999, x: 3, y: 25.7, length: 4, color: '#f59e0b' },
    B1: { zone: 'P1', sides: 1, width: 4, height: 1, opHeight: 999, x: 3, y: 26.2, length: 4, color: '#f59e0b' },
  };

  const branchStaging = {
    'Petersburg': { x: 0.5, y: 1, color: '#ef4444' },
    'Chesterfield': { x: 0.5, y: 4, color: '#f59e0b' },
    'Hanover': { x: 0.5, y: 7, color: '#10b981' },
    'South Hill': { x: 0.5, y: 10, color: '#06b6d4' },
    'Fredericksburg': { x: 0.5, y: 13, color: '#8b5cf6' },
  };

  const aislePathX = 3;

  const getViewTransform = () => {
    if (spectateMode === null) {
      return { scale: zoom, translateX: 0, translateY: 0 };
    }
    
    const picker = pickerStates[spectateMode];
    if (!picker) return { scale: zoom, translateX: 0, translateY: 0 };
    
    const centerX = picker.x * 60 + 150;
    const centerY = picker.y * 60 + 20;
    
    return {
      scale: 1.5,
      translateX: -centerX + 300,
      translateY: -centerY + 400
    };
  };

  const viewTransform = getViewTransform();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg">
        {title}
      </h3>
      
      <div className="relative bg-gray-100 rounded-lg p-6 border-2 border-gray-300 overflow-auto" style={{ height: '600px' }}>
        <div style={{ 
          transform: `scale(${viewTransform.scale}) translate(${viewTransform.translateX}px, ${viewTransform.translateY}px)`,
          transformOrigin: 'top left',
          transition: 'transform 0.3s ease-out',
          width: `${100/viewTransform.scale}%`, 
          height: `${100/viewTransform.scale}%` 
        }}>
          {/* Aisle Path */}
          <div 
            className="absolute bg-gray-300"
            style={{
              left: `${aislePathX * 60 + 150}px`,
              top: '20px',
              width: '4px',
              height: '1600px',
              opacity: 0.5
            }}
          />

          {/* Branch Staging Areas */}
          {Object.entries(branchStaging).map(([branch, pos]) => (
            <div
              key={branch}
              className="absolute rounded-lg border-4 flex flex-col items-center justify-center shadow-lg transition-all duration-300"
              style={{
                left: `${pos.x * 60 + 10}px`,
                top: `${pos.y * 60 + 10}px`,
                width: '100px',
                height: '50px',
                backgroundColor: pos.color,
                borderColor: pos.color,
                opacity: 0.9
              }}
            >
              <span className="text-xs font-bold text-white text-center px-1">{branch}</span>
              <span className="text-xs text-white">({stagedPallets.filter(p => p.branch === branch).length})</span>
            </div>
          ))}

          {/* Staged Pallets with enhanced animation */}
          {stagedPallets.map((pallet, idx) => {
            const stagingPos = branchStaging[pallet.branch];
            const branchPallets = stagedPallets.filter(p => p.branch === pallet.branch);
            const palletIndex = branchPallets.indexOf(pallet);
            const offsetX = (palletIndex % 3) * 15;
            const offsetY = Math.floor(palletIndex / 3) * 8;
            
            // Check if this pallet was just completed (within last 3 seconds of sim time)
            const justCompleted = currentTime - pallet.completedAt < 180;
            
            return (
              <div
                key={idx}
                className={`absolute text-lg transition-all duration-500 ${justCompleted ? 'animate-bounce' : ''}`}
                style={{
                  left: `${stagingPos.x * 60 + 20 + offsetX}px`,
                  top: `${stagingPos.y * 60 + 20 + offsetY}px`,
                  filter: justCompleted ? 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.8))' : 'none',
                  transform: justCompleted ? 'scale(1.2)' : 'scale(1)',
                }}
                title={`Order ${pallet.orderId} - ${pallet.branch}`}
              >
                📦
                {/* Completion sparkle effect */}
                {justCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-yellow-400 text-2xl animate-ping">✨</div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Aisles with proper 3D depth effect */}
          {Object.entries(aisleStructure).map(([aisle, data]) => {
            const pickerInAisle = pickerStates.some(p => 
              Math.abs(p.x - data.x) < 0.5 && Math.abs(p.y - data.y) < 0.5
            );
            
            const baseColor = data.color;
            const darkerColor = `${baseColor}dd`;
            const darkestColor = `${baseColor}aa`;
            
            return (
              <div
                key={aisle}
                className="absolute"
                style={{
                  left: `${data.x * 60 + 150 - (data.length * 2)}px`,
                  top: `${data.y * 60 + 20}px`,
                  width: `${data.length * 4}px`,
                  height: '50px',
                }}
              >
                {/* Bottom shadow layer for depth */}
                <div
                  className="absolute rounded-lg"
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000',
                    opacity: 0.2,
                    transform: 'translate(6px, 8px)',
                    filter: 'blur(4px)',
                  }}
                />
                
                {/* Main aisle body with layers */}
                <div
                  className="absolute rounded-lg border-2 transition-all duration-300"
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: baseColor,
                    borderColor: pickerInAisle ? '#fbbf24' : 'rgba(0,0,0,0.2)',
                    boxShadow: pickerInAisle 
                      ? `0 0 20px rgba(251, 191, 36, 0.6), 
                         inset 0 2px 0 rgba(255,255,255,0.3),
                         inset 0 -2px 6px rgba(0,0,0,0.2),
                         0 4px 0 ${darkerColor},
                         0 6px 0 ${darkestColor},
                         0 8px 12px rgba(0,0,0,0.4)`
                      : `inset 0 2px 0 rgba(255,255,255,0.3),
                         inset 0 -2px 6px rgba(0,0,0,0.2),
                         0 4px 0 ${darkerColor},
                         0 6px 0 ${darkestColor},
                         0 8px 12px rgba(0,0,0,0.3)`,
                    transform: pickerInAisle ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                >
                  {/* Top highlight for 3D effect */}
                  <div
                    className="absolute top-0 left-0 right-0 h-2 rounded-t-lg"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)',
                    }}
                  />
                  
                  {/* Content */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm font-bold drop-shadow-md">{aisle}</div>
                      <div className="text-xs drop-shadow">{data.sides === 2 ? '2-side' : '1-side'}</div>
                    </div>
                  </div>
                  
                  {/* Side edge for depth */}
                  <div
                    className="absolute right-0 top-1 bottom-1 w-1 rounded-r"
                    style={{
                      backgroundColor: darkestColor,
                      transform: 'translateX(3px)',
                    }}
                  />
                  
                  {/* Bottom edge for depth */}
                  <div
                    className="absolute left-1 right-1 bottom-0 h-1 rounded-b"
                    style={{
                      backgroundColor: darkestColor,
                      transform: 'translateY(3px)',
                    }}
                  />
                </div>
                
                {/* Activity indicator */}
                {pickerInAisle && (
                  <>
                    <div 
                      className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-lg z-10 flex items-center justify-center"
                    >
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-ping" />
                    </div>
                    <div className="absolute -top-1 left-0 right-0 text-center">
                      <span className="text-xs font-bold text-yellow-600 drop-shadow-md">ACTIVE</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Picker Paths with enhanced gradients */}
          {Object.entries(pickerPaths).map(([pickerIdx, path]) => (
            <svg
              key={pickerIdx}
              className="absolute pointer-events-none"
              style={{ left: 0, top: 0, width: '100%', height: '100%' }}
            >
              <defs>
                <linearGradient id={`gradient-${pickerIdx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={pickerColors[pickerIdx]} stopOpacity="0.1" />
                  <stop offset="50%" stopColor={pickerColors[pickerIdx]} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={pickerColors[pickerIdx]} stopOpacity="0.9" />
                </linearGradient>
                <filter id={`glow-${pickerIdx}`}>
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <line
                x1={path.fromX * 60 + 150}
                y1={path.fromY * 60 + 45}
                x2={path.fromX * 60 + 150 + (path.toX - path.fromX) * 60 * path.progress}
                y2={path.fromY * 60 + 45 + (path.toY - path.fromY) * 60 * path.progress}
                stroke={`url(#gradient-${pickerIdx})`}
                strokeWidth="5"
                strokeDasharray="8,4"
                strokeLinecap="round"
                filter={`url(#glow-${pickerIdx})`}
              />
              {/* Direction arrow */}
              <circle
                cx={path.fromX * 60 + 150 + (path.toX - path.fromX) * 60 * path.progress}
                cy={path.fromY * 60 + 45 + (path.toY - path.fromY) * 60 * path.progress}
                r="3"
                fill={pickerColors[pickerIdx]}
              />
            </svg>
          ))}

          {/* Pickers with enhanced animations */}
          {pickerStates.map((picker, idx) => {
            const isPicking = picker.status === 'picking';
            const isWaiting = picker.status.includes('WAITING');
            const isWrapping = picker.status === 'wrapping pallet';
            
            return (
              <div
                key={idx}
                className="absolute transition-all duration-100"
                style={{
                  left: `${picker.x * 60 + 150}px`,
                  top: `${picker.y * 60 + 20}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: spectateMode === idx ? 200 : 100
                }}
              >
                {/* Glow effect for active pickers */}
                {(isPicking || isWrapping) && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{
                      backgroundColor: picker.color,
                      opacity: 0.3,
                      width: '50px',
                      height: '50px',
                      left: '-5px',
                      top: '-5px'
                    }}
                  />
                )}
                
                {/* Shadow effect */}
                <div
                  className="absolute w-10 h-10 rounded-full opacity-20 blur-sm"
                  style={{
                    backgroundColor: '#000',
                    top: '42px',
                    left: '0'
                  }}
                />
                
                {/* Main picker avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xl transition-all duration-300 relative ${
                    spectateMode === idx ? 'border-8 border-yellow-400 animate-pulse' : 'border-4 border-white'
                  } ${isWaiting ? 'animate-bounce' : isPicking ? 'scale-110' : ''}`}
                  style={{ 
                    backgroundColor: picker.color,
                    boxShadow: spectateMode === idx 
                      ? `0 0 30px ${picker.color}` 
                      : isWaiting 
                      ? '0 0 20px rgba(239, 68, 68, 0.8)'
                      : `0 4px 15px ${picker.color}88`
                  }}
                >
                  {picker.name.slice(0, 2)}
                  
                  {/* Equipment indicator badge */}
                  {picker.equipment !== 'none' && picker.equipment !== 'wrapper' && (
                    <div 
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center text-xs"
                      style={{ borderColor: picker.color }}
                    >
                      {picker.equipment === 'order_picker' && '🏗️'}
                      {picker.equipment === 'forklift' && '🚜'}
                      {picker.equipment === 'walk' && '🚶'}
                    </div>
                  )}
                </div>
                
                {/* Pick animation effect */}
                {isPicking && (
                  <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none">
                    <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-pulse" />
                  </div>
                )}
                
                {/* Status tooltip */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                  <div className={`${
                    isWaiting 
                      ? 'bg-red-600 animate-pulse shadow-lg shadow-red-500/50' 
                      : isPicking
                      ? 'bg-green-600 shadow-lg shadow-green-500/50'
                      : isWrapping
                      ? 'bg-purple-600 shadow-lg shadow-purple-500/50'
                      : 'bg-black bg-opacity-90'
                  } text-white text-xs px-2 py-1 rounded-md shadow-lg max-w-xs transition-all duration-300`}>
                    {picker.status}
                    {picker.zoneGroup && <span className="ml-1 text-yellow-300">({picker.zoneGroup})</span>}
                  </div>
                  {picker.currentLocation && (
                    <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md mt-1 shadow font-mono animate-fade-in">
                      {picker.equipment === 'order_picker' && '🏗️ OP: '}
                      {picker.equipment === 'forklift' && '🚜 FK: '}
                      {picker.equipment === 'walk' && '🚶 PJ: '}
                      {picker.equipment === 'pallet_jack' && '🚶 PJ: '}
                      {picker.equipment === 'wrapper' && '🎁 Wrapping'}
                      {picker.equipment !== 'wrapper' && picker.currentLocation}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Picker Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {pickerStates.map((picker, idx) => (
          <div 
            key={idx} 
            className={`bg-white border-2 p-2 rounded-lg shadow cursor-pointer hover:border-yellow-400 transition-all ${
              spectateMode === idx ? 'border-yellow-400 border-4' : 'border-gray-200'
            }`}
            onClick={() => onPickerClick(idx)}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" 
                style={{ backgroundColor: picker.color }}>
                {picker.name.slice(0, 2)}
              </div>
              <span className="font-bold text-xs">{picker.name}</span>
            </div>
            <div className="text-xs text-gray-600 space-y-0.5">
              <div className={picker.status.includes('WAITING') ? 'text-red-600 font-bold' : ''}>
                {picker.status.length > 20 ? picker.status.slice(0, 20) + '...' : picker.status}
              </div>
              <div>Items: {picker.itemsPickedToday}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WarehousePickingSimulator = () => {
  const [config, setConfig] = useState({
    numPickers: 5,
    numForklifts: 2,
    numOrderPickers: 2,
    numWrappers: 2,
    numOrders: 20,
    linesPerOrderMin: 30,
    linesPerOrderMax: 50,
    walkSpeed: 1.2,
    orderPickerSpeed: 2.0,
    forkliftSpeed: 1.8,
    pickTimeGround: 15,
    pickTimeOrderPicker: 25,
    pickTimeForklift: 35,
    wrapTime: 180,
    equipmentChangeTime: 120,
    o1o2Percentage: 60,
  });

  const [pickerConfigs, setPickerConfigs] = useState([
    { name: 'Scott', zoneAssignment: 'O1O2_Priority', equipmentType: 'order_picker', pickTimeWalk: 15, pickTimeOP: 25, pickTimeForklift: 35, wrapTime: 180 },
    { name: 'Jacob', zoneAssignment: 'Any', equipmentType: 'all', pickTimeWalk: 15, pickTimeOP: 25, pickTimeForklift: 35, wrapTime: 180 },
    { name: 'Bradley', zoneAssignment: 'Any', equipmentType: 'all', pickTimeWalk: 15, pickTimeOP: 25, pickTimeForklift: 35, wrapTime: 180 },
    { name: 'Bao', zoneAssignment: 'Any', equipmentType: 'all', pickTimeWalk: 15, pickTimeOP: 25, pickTimeForklift: 35, wrapTime: 180 },
    { name: 'Christian', zoneAssignment: 'Any', equipmentType: 'all', pickTimeWalk: 15, pickTimeOP: 25, pickTimeForklift: 35, wrapTime: 180 },
  ]);

  const [showConfig, setShowConfig] = useState(false);
  const [showPickerConfig, setShowPickerConfig] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(10);
  const [currentTime, setCurrentTime] = useState(0);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [zoneAnimation, setZoneAnimation] = useState(null);
  const [equipmentAnimation, setEquipmentAnimation] = useState(null);
  const [zoneStagedPallets, setZoneStagedPallets] = useState([]);
  const [equipmentStagedPallets, setEquipmentStagedPallets] = useState([]);
  const [zonePickerPaths, setZonePickerPaths] = useState({});
  const [equipmentPickerPaths, setEquipmentPickerPaths] = useState({});
  const [zoom, setZoom] = useState(0.8);
  const [spectateMode, setSpectateMode] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showOrdersList, setShowOrdersList] = useState(false);
  const [showComparisonResults, setShowComparisonResults] = useState(false);
  const [activityPicker, setActivityPicker] = useState(null);
  const animationRef = useRef(null);

  const pickerNames = ['Scott', 'Jacob', 'Bradley', 'Bao', 'Christian'];
  const pickerColors = ['#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'];

  // ... (keeping the same aisleStructure, branchStaging, and order generation functions from original)
  const aisleStructure = {
    W1: { zone: 'O1', sides: 2, width: 16, height: 21, opHeight: 6, x: 3, y: 1, length: 16, color: '#3b82f6' },
    W2: { zone: 'O1', sides: 2, width: 16, height: 21, opHeight: 6, x: 3, y: 2.8, length: 16, color: '#3b82f6' },
    W3: { zone: 'O1', sides: 2, width: 16, height: 21, opHeight: 6, x: 3, y: 4.6, length: 16, color: '#3b82f6' },
    W4: { zone: 'O2', sides: 2, width: 16, height: 21, opHeight: 6, x: 3, y: 6.4, length: 16, color: '#8b5cf6' },
    W5: { zone: 'O2', sides: 2, width: 16, height: 21, opHeight: 6, x: 3, y: 8.2, length: 16, color: '#8b5cf6' },
    W6: { zone: 'P1', sides: 1, width: 21, height: 7, opHeight: 4, x: 3, y: 10.0, length: 21, color: '#10b981' },
    W7: { zone: 'P1', sides: 2, width: 21, height: 5, opHeight: 2, x: 3, y: 12.1, length: 21, color: '#10b981' },
    W8: { zone: 'P1', sides: 2, width: 21, height: 5, opHeight: 2, x: 3, y: 14.2, length: 21, color: '#10b981' },
    W9: { zone: 'P1', sides: 2, width: 21, height: 5, opHeight: 2, x: 3, y: 16.3, length: 21, color: '#10b981' },
    W10: { zone: 'P1', sides: 2, width: 21, height: 5, opHeight: 2, x: 3, y: 18.4, length: 21, color: '#10b981' },
    W11: { zone: 'P1', sides: 2, width: 21, height: 5, opHeight: 2, x: 3, y: 20.5, length: 21, color: '#10b981' },
    W12: { zone: 'P1', sides: 1, width: 21, height: 7, opHeight: 4, x: 3, y: 22.6, length: 21, color: '#10b981' },
    B4: { zone: 'P1', sides: 1, width: 4, height: 1, opHeight: 999, x: 3, y: 24.7, length: 4, color: '#f59e0b' },
    B3: { zone: 'P1', sides: 1, width: 4, height: 1, opHeight: 999, x: 3, y: 25.2, length: 4, color: '#f59e0b' },
    B2: { zone: 'P1', sides: 1, width: 4, height: 1, opHeight: 999, x: 3, y: 25.7, length: 4, color: '#f59e0b' },
    B1: { zone: 'P1', sides: 1, width: 4, height: 1, opHeight: 999, x: 3, y: 26.2, length: 4, color: '#f59e0b' },
  };

  const branches = ['Petersburg', 'Chesterfield', 'Hanover', 'South Hill', 'Fredericksburg'];

  const generateItemLocation = (aisle) => {
    const structure = aisleStructure[aisle];
    
    let side, width;
    if (structure.sides === 2) {
      const isSecondSide = Math.random() > 0.5;
      if (isSecondSide) {
        side = Math.floor(Math.random() * structure.width) + structure.width + 1;
        width = side - structure.width;
      } else {
        side = Math.floor(Math.random() * structure.width) + 1;
        width = side;
      }
    } else {
      side = Math.floor(Math.random() * structure.width) + 1;
      width = side;
    }

    const height = Math.floor(Math.random() * structure.height) + 1;

    let equipment;
    if (aisle.startsWith('B')) {
      equipment = Math.random() < 0.8 ? 'forklift' : 'walk';
    } else if (height >= structure.opHeight) {
      equipment = 'order_picker';
    } else {
      equipment = 'walk';
    }

    const totalWidth = structure.sides === 2 ? structure.width * 2 : structure.width;
    const positionAlongAisle = (side - 1) / totalWidth;
    const lengthOffset = (positionAlongAisle - 0.5) * (structure.length * 0.07);

    return {
      aisle,
      side: side.toString().padStart(2, '0'),
      width: width.toString().padStart(2, '0'),
      height: height.toString().padStart(2, '0'),
      equipment,
      fullLocation: `${aisle}-01-${side.toString().padStart(2, '0')}-${height.toString().padStart(2, '0')}`,
      x: structure.x + lengthOffset,
      y: structure.y,
    };
  };

  const generateOrder = (orderId) => {
    const linesCount = Math.floor(Math.random() * (config.linesPerOrderMax - config.linesPerOrderMin + 1)) + config.linesPerOrderMin;
    const branch = branches[Math.floor(Math.random() * branches.length)];
    
    const o1o2Count = Math.round(linesCount * (config.o1o2Percentage / 100));
    const p1Count = linesCount - o1o2Count;

    const lines = [];
    const aisleO1O2 = ['W1', 'W2', 'W3', 'W4', 'W5'];
    const aisleP1 = ['W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'B1', 'B2', 'B3', 'B4'];

    for (let i = 0; i < o1o2Count; i++) {
      const aisle = aisleO1O2[Math.floor(Math.random() * aisleO1O2.length)];
      const item = generateItemLocation(aisle);
      lines.push({
        id: `${orderId}-${i}`,
        ...item,
        zone: aisleStructure[aisle].zone,
        zoneGroup: 'O1O2'
      });
    }

    for (let i = 0; i < p1Count; i++) {
      const aisle = aisleP1[Math.floor(Math.random() * aisleP1.length)];
      const item = generateItemLocation(aisle);
      lines.push({
        id: `${orderId}-${o1o2Count + i}`,
        ...item,
        zone: aisleStructure[aisle].zone,
        zoneGroup: 'P1'
      });
    }

    const aisleOrder = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'B1', 'B2', 'B3', 'B4'];
    lines.sort((a, b) => aisleOrder.indexOf(a.aisle) - aisleOrder.indexOf(b.aisle));

    return { 
      id: orderId, 
      branch, 
      lines,
      o1o2Lines: lines.filter(l => l.zoneGroup === 'O1O2'),
      p1Lines: lines.filter(l => l.zoneGroup === 'P1')
    };
  };

  const generateNewOrders = () => {
    const newOrders = [];
    for (let i = 0; i < config.numOrders; i++) {
      newOrders.push(generateOrder(i));
    }
    setOrders(newOrders);
    setZoneAnimation(null);
    setEquipmentAnimation(null);
    setAnimating(false);
    setCurrentTime(0);
  };

  useEffect(() => {
    generateNewOrders();
  }, [config.numOrders]);

  const generateAnimationData = (method, allOrders) => {
    const branchStaging = {
      'Petersburg': { x: 0.5, y: 1, color: '#ef4444' },
      'Chesterfield': { x: 0.5, y: 4, color: '#f59e0b' },
      'Hanover': { x: 0.5, y: 7, color: '#10b981' },
      'South Hill': { x: 0.5, y: 10, color: '#06b6d4' },
      'Fredericksburg': { x: 0.5, y: 13, color: '#8b5cf6' },
    };

    const events = [];
    const pickerState = pickerNames.map((name, idx) => ({
      name,
      currentOrder: null,
      finishTime: 0,
      totalItems: 0,
      totalWaitTime: 0,
      ordersCompleted: 0,
      currentPos: { x: 0.5, y: 1 },
      equipmentUsage: { walk: 0, order_picker: 0, forklift: 0 },
      zoneUsage: { O1O2: 0, P1: 0 },
      assignedZone: method === 'zone' ? pickerConfigs[idx].zoneAssignment : null,
      assignedEquipment: method === 'equipment' ? pickerConfigs[idx].equipmentType : null
    }));

    const resources = {
      forklifts: Array(config.numForklifts).fill(null).map(() => ({ busy: false, freeAt: 0 })),
      orderPickers: Array(config.numOrderPickers).fill(null).map(() => ({ busy: false, freeAt: 0 })),
      wrappers: Array(config.numWrappers).fill(null).map(() => ({ busy: false, freeAt: 0 })),
      o1o2Slots: Array(2).fill(null).map(() => ({ busy: false, freeAt: 0 })),
    };

    const completedPallets = [];
    const o1o2Queue = [];
    const p1Queue = [];
    
    allOrders.forEach(order => {
      if (order.o1o2Lines.length > 0) {
        o1o2Queue.push({
          ...order,
          lines: order.o1o2Lines,
          zoneGroup: 'O1O2',
          partialOrderId: `${order.id}-O1O2`
        });
      }
      if (order.p1Lines.length > 0) {
        p1Queue.push({
          ...order,
          lines: order.p1Lines,
          zoneGroup: 'P1',
          partialOrderId: `${order.id}-P1`
        });
      }
    });

    let totalOrdersToProcess;
    if (method === 'zone') {
      totalOrdersToProcess = o1o2Queue.length + p1Queue.length;
    } else {
      totalOrdersToProcess = allOrders.length;
    }

    let time = 0;
    let totalWaitTime = 0;
    let equipmentWaitEvents = 0;
    let wrapperWaitEvents = 0;
    const scottIndex = 0;
    const aislePathX = 3;

    const findFreeResource = (type, atTime) => {
      const pool = resources[type];
      for (let i = 0; i < pool.length; i++) {
        if (pool[i].freeAt <= atTime) {
          return i;
        }
      }
      return -1;
    };

    const addTravelEvent = (pickTime, pickerIdx, fromPos, toPos, speed) => {
      if (fromPos.x !== aislePathX) {
        const horizontalDist = Math.abs(fromPos.x - aislePathX);
        const horizontalTime = (horizontalDist * 10) / speed;
        events.push({
          time: pickTime,
          type: 'travel',
          picker: pickerIdx,
          fromX: fromPos.x,
          fromY: fromPos.y,
          toX: aislePathX,
          toY: fromPos.y,
          duration: horizontalTime
        });
        pickTime += horizontalTime;
        fromPos = { x: aislePathX, y: fromPos.y };
      }

      if (fromPos.y !== toPos.y) {
        const verticalDist = Math.abs(fromPos.y - toPos.y);
        const verticalTime = (verticalDist * 10) / speed;
        events.push({
          time: pickTime,
          type: 'travel',
          picker: pickerIdx,
          fromX: aislePathX,
          fromY: fromPos.y,
          toX: aislePathX,
          toY: toPos.y,
          duration: verticalTime
        });
        pickTime += verticalTime;
        fromPos = { x: aislePathX, y: toPos.y };
      }

      if (toPos.x !== aislePathX) {
        const horizontalDist = Math.abs(toPos.x - aislePathX);
        const horizontalTime = (horizontalDist * 10) / speed;
        events.push({
          time: pickTime,
          type: 'travel',
          picker: pickerIdx,
          fromX: aislePathX,
          fromY: toPos.y,
          toX: toPos.x,
          toY: toPos.y,
          duration: horizontalTime
        });
        pickTime += horizontalTime;
      }

      return pickTime;
    };

    if (method === 'zone') {
      while (o1o2Queue.length > 0 || p1Queue.length > 0 || pickerState.some(p => p.currentOrder !== null)) {
        for (let pickerIdx = 0; pickerIdx < config.numPickers; pickerIdx++) {
          if (pickerState[pickerIdx].finishTime <= time && pickerState[pickerIdx].currentOrder === null) {
            let order = null;
            let assignedQueue = null;

            const canPickO1O2 = o1o2Queue.length > 0 && findFreeResource('o1o2Slots', time) !== -1;
            const canPickP1 = p1Queue.length > 0;
            
            if (pickerIdx === scottIndex) {
              if (canPickO1O2) {
                assignedQueue = 'O1O2';
              } else if (canPickP1) {
                assignedQueue = 'P1';
              }
            } else {
              if (canPickO1O2 && canPickP1) {
                assignedQueue = o1o2Queue.length >= p1Queue.length ? 'O1O2' : 'P1';
              } else if (canPickO1O2) {
                assignedQueue = 'O1O2';
              } else if (canPickP1) {
                assignedQueue = 'P1';
              }
            }

            if (assignedQueue === 'O1O2') {
              order = o1o2Queue.shift();
            } else if (assignedQueue === 'P1') {
              order = p1Queue.shift();
            }

            if (order) {
              let o1o2SlotIdx = -1;
              if (order.zoneGroup === 'O1O2') {
                o1o2SlotIdx = findFreeResource('o1o2Slots', time);
                pickerState[pickerIdx].zoneUsage.O1O2++;
              } else {
                pickerState[pickerIdx].zoneUsage.P1++;
              }

              pickerState[pickerIdx].currentOrder = order;
              
              events.push({
                time,
                type: 'start_order',
                picker: pickerIdx,
                order: order.partialOrderId,
                branch: order.branch,
                zoneGroup: order.zoneGroup
              });

              let pickTime = time;
              let currentPos = pickerState[pickerIdx].currentPos;
              let remainingLines = [...order.lines];
              let skippedLines = [];

              while (remainingLines.length > 0 || skippedLines.length > 0) {
                let pickedThisPass = false;

                for (let i = remainingLines.length - 1; i >= 0; i--) {
                  const line = remainingLines[i];
                  let canPickNow = true;

                  if (line.equipment === 'forklift') {
                    if (findFreeResource('forklifts', pickTime) === -1) canPickNow = false;
                  } else if (line.equipment === 'order_picker') {
                    if (findFreeResource('orderPickers', pickTime) === -1) canPickNow = false;
                  }

                  if (canPickNow) {
                    let resourceIdx = -1;
                    if (line.equipment === 'forklift') {
                      resourceIdx = findFreeResource('forklifts', pickTime);
                      resources.forklifts[resourceIdx].busy = true;
                      resources.forklifts[resourceIdx].freeAt = pickTime + pickerConfigs[pickerIdx].pickTimeForklift;
                    } else if (line.equipment === 'order_picker') {
                      resourceIdx = findFreeResource('orderPickers', pickTime);
                      resources.orderPickers[resourceIdx].busy = true;
                      resources.orderPickers[resourceIdx].freeAt = pickTime + pickerConfigs[pickerIdx].pickTimeOP;
                    }

                    const speed = line.equipment === 'forklift' ? config.forkliftSpeed :
                                  line.equipment === 'order_picker' ? config.orderPickerSpeed :
                                  config.walkSpeed;
                    
                    pickTime = addTravelEvent(pickTime, pickerIdx, currentPos, line, speed);
                    currentPos = { x: line.x, y: line.y };

                    events.push({
                      time: pickTime,
                      type: 'pick_item', picker: pickerIdx, x: line.x, y: line.y,
                      equipment: line.equipment, aisle: line.aisle, fullLocation: line.fullLocation, itemId: line.id
                    });
                    
                    const itemPickTime = line.equipment === 'forklift' ? pickerConfigs[pickerIdx].pickTimeForklift :
                                         line.equipment === 'order_picker' ? pickerConfigs[pickerIdx].pickTimeOP :
                                         pickerConfigs[pickerIdx].pickTimeWalk;
                    pickTime += itemPickTime;
                    pickerState[pickerIdx].totalItems++;
                    pickerState[pickerIdx].equipmentUsage[line.equipment]++;
                    remainingLines.splice(i, 1);
                    pickedThisPass = true;
                  } else {
                    skippedLines.push(line);
                    remainingLines.splice(i, 1);
                  }
                }

                if (!pickedThisPass && skippedLines.length > 0) {
                  remainingLines = [...skippedLines];
                  skippedLines = [];
                  
                  const needsForklift = remainingLines.some(l => l.equipment === 'forklift');
                  const needsOrderPicker = remainingLines.some(l => l.equipment === 'order_picker');
                  
                  let minWaitTime = Infinity;
                  if (needsForklift) {
                    const earliestFork = Math.min(...resources.forklifts.map(f => f.freeAt));
                    if (earliestFork > pickTime) minWaitTime = Math.min(minWaitTime, earliestFork - pickTime);
                  }
                  if (needsOrderPicker) {
                    const earliestOP = Math.min(...resources.orderPickers.map(op => op.freeAt));
                    if (earliestOP > pickTime) minWaitTime = Math.min(minWaitTime, earliestOP - pickTime);
                  }
                  
                  if (minWaitTime !== Infinity && minWaitTime > 0) {
                    const equipNeeded = needsForklift && needsOrderPicker ? 'forklift/order_picker' : needsForklift ? 'forklift' : 'order_picker';
                    events.push({
                      time: pickTime, type: 'wait_equipment', picker: pickerIdx, equipment: equipNeeded,
                      duration: minWaitTime, x: currentPos.x, y: currentPos.y
                    });
                    pickTime += minWaitTime;
                    totalWaitTime += minWaitTime;
                    equipmentWaitEvents++;
                  }
                }

                if (remainingLines.length === 0 && skippedLines.length > 0) {
                  remainingLines = [...skippedLines];
                  skippedLines = [];
                }
              }

              const stagingPos = branchStaging[order.branch];
              pickTime = addTravelEvent(pickTime, pickerIdx, currentPos, stagingPos, config.walkSpeed);
              currentPos = stagingPos;

              events.push({
                time: pickTime, type: 'return_staging', picker: pickerIdx,
                x: stagingPos.x, y: stagingPos.y, branch: order.branch
              });

              const wrapIdx = findFreeResource('wrappers', pickTime);
              if (wrapIdx === -1) {
                const earliestFree = Math.min(...resources.wrappers.map(w => w.freeAt));
                const wrapWait = Math.max(0, earliestFree - pickTime);
                events.push({
                  time: pickTime, type: 'wait_wrapper', picker: pickerIdx, duration: wrapWait,
                  x: currentPos.x, y: currentPos.y
                });
                pickTime += wrapWait;
                totalWaitTime += wrapWait;
                wrapperWaitEvents++;
              }

              const finalWrapIdx = findFreeResource('wrappers', pickTime);
              resources.wrappers[finalWrapIdx].busy = true;
              resources.wrappers[finalWrapIdx].freeAt = pickTime + pickerConfigs[pickerIdx].wrapTime;

              events.push({
                time: pickTime, type: 'wrapping', picker: pickerIdx,
                x: currentPos.x, y: currentPos.y
              });

              pickTime += pickerConfigs[pickerIdx].wrapTime;
                  
              if (o1o2SlotIdx !== -1) {
                resources.o1o2Slots[o1o2SlotIdx].busy = true;
                resources.o1o2Slots[o1o2SlotIdx].freeAt = pickTime;
              }

              events.push({
                time: pickTime, type: 'complete_order', picker: pickerIdx, order: order.partialOrderId,
                branch: order.branch, x: currentPos.x, y: currentPos.y
              });

              completedPallets.push({
                orderId: order.partialOrderId, branch: order.branch, completedAt: pickTime,
                x: currentPos.x, y: currentPos.y
              });

              pickerState[pickerIdx].finishTime = pickTime;
              pickerState[pickerIdx].currentOrder = null;
              pickerState[pickerIdx].currentPos = currentPos;
              pickerState[pickerIdx].ordersCompleted++;
            }
          }
        }

        time += 1;
        if (time > 30000) break;
      }
    } else {
      let orderQueue = [...allOrders];
      
      while (orderQueue.length > 0 || pickerState.some(p => p.currentOrder !== null)) {
        for (let pickerIdx = 0; pickerIdx < config.numPickers; pickerIdx++) {
          if (pickerState[pickerIdx].finishTime <= time && pickerState[pickerIdx].currentOrder === null) {
            const order = orderQueue.shift();
            if (order) {
              pickerState[pickerIdx].currentOrder = order;
              events.push({
                time,
                type: 'start_order',
                picker: pickerIdx,
                order: order.id,
                branch: order.branch
              });

              const linesByEquipment = {
                walk: [],
                order_picker: [],
                forklift: [],
              };
              
              order.lines.forEach(line => {
                linesByEquipment[line.equipment].push(line);
              });

              let pickTime = time;
              let currentPos = pickerState[pickerIdx].currentPos;
              const stagingPos = branchStaging[order.branch];

              ['walk', 'order_picker', 'forklift'].forEach((equipType, idx) => {
                const lines = linesByEquipment[equipType];
                if (lines.length === 0) return;

                if (idx > 0) {
                  const displayEquip = equipType === 'walk' ? 'pallet_jack' : equipType;
                  events.push({
                    time: pickTime,
                    type: 'change_equipment',
                    picker: pickerIdx,
                    equipment: displayEquip,
                    x: currentPos.x,
                    y: currentPos.y
                  });
                  pickTime += config.equipmentChangeTime;
                }

                const speed = equipType === 'forklift' ? config.forkliftSpeed :
                              equipType === 'order_picker' ? config.orderPickerSpeed :
                              config.walkSpeed;

                lines.forEach(line => {
                  pickTime = addTravelEvent(pickTime, pickerIdx, currentPos, line, speed);
                  currentPos = { x: line.x, y: line.y };

                  events.push({
                    time: pickTime,
                    type: 'pick_item',
                    picker: pickerIdx,
                    x: line.x,
                    y: line.y,
                    equipment: equipType,
                    aisle: line.aisle,
                    fullLocation: line.fullLocation,
                    itemId: line.id
                  });
                  
                  const itemPickTime = equipType === 'forklift' ? pickerConfigs[pickerIdx].pickTimeForklift :
                                       equipType === 'order_picker' ? pickerConfigs[pickerIdx].pickTimeOP :
                                       pickerConfigs[pickerIdx].pickTimeWalk;
                  pickTime += itemPickTime;
                  pickerState[pickerIdx].totalItems++;
                  pickerState[pickerIdx].equipmentUsage[equipType]++;
                });

                pickTime = addTravelEvent(pickTime, pickerIdx, currentPos, stagingPos, speed);
                currentPos = stagingPos;

                events.push({
                  time: pickTime,
                  type: 'return_staging',
                  picker: pickerIdx,
                  x: stagingPos.x,
                  y: stagingPos.y,
                  branch: order.branch
                });
              });

              const wrapIdx = findFreeResource('wrappers', pickTime);
              if (wrapIdx === -1) {
                const earliestFree = Math.min(...resources.wrappers.map(w => w.freeAt));
                const wrapWait = Math.max(0, earliestFree - pickTime);
                events.push({
                  time: pickTime,
                  type: 'wait_wrapper',
                  picker: pickerIdx,
                  duration: wrapWait,
                  x: currentPos.x,
                  y: currentPos.y
                });
                pickTime += wrapWait;
                totalWaitTime += wrapWait;
                wrapperWaitEvents++;
              }

              const wrapIdx2 = findFreeResource('wrappers', pickTime);
              resources.wrappers[wrapIdx2].busy = true;
              resources.wrappers[wrapIdx2].freeAt = pickTime + pickerConfigs[pickerIdx].wrapTime;

              events.push({
                time: pickTime,
                type: 'wrapping',
                picker: pickerIdx,
                x: currentPos.x,
                y: currentPos.y
              });

              pickTime += pickerConfigs[pickerIdx].wrapTime;

              events.push({
                time: pickTime,
                type: 'complete_order',
                picker: pickerIdx,
                order: order.id,
                branch: order.branch,
                x: currentPos.x,
                y: currentPos.y
              });

              completedPallets.push({
                orderId: order.id,
                branch: order.branch,
                completedAt: pickTime,
                x: currentPos.x,
                y: currentPos.y
              });

              pickerState[pickerIdx].finishTime = pickTime;
              pickerState[pickerIdx].currentOrder = null;
              pickerState[pickerIdx].currentPos = currentPos;
              pickerState[pickerIdx].ordersCompleted++;
            }
          }
        }

        time += 1;
        if (time > 30000) break;
      }
    }

    const totalTime = Math.max(...pickerState.map(p => p.finishTime));
    const totalItems = pickerState.reduce((sum, p) => sum + p.totalItems, 0);

    const finalPickerStats = pickerState.map(p => ({
      name: p.name,
      ordersCompleted: p.ordersCompleted,
      itemsPicked: p.totalItems,
      equipmentUsage: p.equipmentUsage,
      zoneUsage: p.zoneUsage,
      assignedZone: p.assignedZone,
      assignedEquipment: p.assignedEquipment
    }));

    return { 
      events, 
      totalTime, 
      totalItems,
      totalWaitTime,
      equipmentWaitEvents,
      wrapperWaitEvents,
      completedPallets,
      totalOrdersToProcess,
      finalPickerStats,
      method 
    };
  };

  const startComparison = () => {
    const zoneData = generateAnimationData('zone', orders);
    const equipmentData = generateAnimationData('equipment', orders);
    
    setZoneAnimation(zoneData);
    setEquipmentAnimation(equipmentData);
    setComparisonMode(true);
    setCurrentTime(0);
    setZoneStagedPallets([]);
    setEquipmentStagedPallets([]);
    setZonePickerPaths({});
    setEquipmentPickerPaths({});
    setSpectateMode(null);
    setAnimating(true);
  };

  useEffect(() => {
    if (animating && comparisonMode && zoneAnimation && equipmentAnimation) {
      const maxTime = Math.max(zoneAnimation.totalTime, equipmentAnimation.totalTime);
      
      animationRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + animationSpeed;
          if (next >= maxTime) {
            setAnimating(false);
            setShowComparisonResults(true); // Automatically show results when done
            return maxTime;
          }
          return next;
        });
      }, 100);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [animating, comparisonMode, animationSpeed, zoneAnimation, equipmentAnimation]);

  useEffect(() => {
    if (zoneAnimation) {
      const zonePallets = zoneAnimation.completedPallets.filter(p => p.completedAt <= currentTime);
      setZoneStagedPallets(zonePallets);

      const paths = {};
      for (let i = 0; i < pickerNames.length; i++) {
        const pickerEvents = zoneAnimation.events.filter(e => 
          e.picker === i && e.type === 'travel' && e.time <= currentTime && e.time + e.duration >= currentTime
        );
        if (pickerEvents.length > 0) {
          const event = pickerEvents[pickerEvents.length - 1];
          const progress = (currentTime - event.time) / event.duration;
          paths[i] = {
            fromX: event.fromX,
            fromY: event.fromY,
            toX: event.toX,
            toY: event.toY,
            progress: Math.min(1, progress)
          };
        }
      }
      setZonePickerPaths(paths);
    }

    if (equipmentAnimation) {
      const equipPallets = equipmentAnimation.completedPallets.filter(p => p.completedAt <= currentTime);
      setEquipmentStagedPallets(equipPallets);

      const paths = {};
      for (let i = 0; i < pickerNames.length; i++) {
        const pickerEvents = equipmentAnimation.events.filter(e => 
          e.picker === i && e.type === 'travel' && e.time <= currentTime && e.time + e.duration >= currentTime
        );
        if (pickerEvents.length > 0) {
          const event = pickerEvents[pickerEvents.length - 1];
          const progress = (currentTime - event.time) / event.duration;
          paths[i] = {
            fromX: event.fromX,
            fromY: event.fromY,
            toX: event.toX,
            toY: event.toY,
            progress: Math.min(1, progress)
          };
        }
      }
      setEquipmentPickerPaths(paths);
    }
  }, [currentTime, zoneAnimation, equipmentAnimation]);

  const getPickerStates = (animData) => {
    if (!animData) return [];
    
    const states = pickerNames.map((name, idx) => ({
      index: idx,
      name,
      x: 0.5,
      y: 1,
      status: 'idle',
      equipment: 'none',
      color: pickerColors[idx],
      currentItem: null,
      currentLocation: null,
      itemsPickedToday: 0,
      currentOrder: null,
      zoneGroup: null
    }));

    animData.events.forEach(event => {
      if (event.time <= currentTime) {
        const picker = states[event.picker];
        
        if (event.type === 'start_order') {
          picker.currentOrder = `Order ${event.order} (${event.branch})`;
          picker.status = 'starting order';
          picker.zoneGroup = event.zoneGroup;
        } else if (event.type === 'travel') {
          const progress = Math.min(1, (currentTime - event.time) / event.duration);
          picker.x = event.fromX + (event.toX - event.fromX) * progress;
          picker.y = event.fromY + (event.toY - event.fromY) * progress;
          picker.status = 'traveling';
        } else if (event.type === 'pick_item') {
          picker.x = event.x;
          picker.y = event.y;
          picker.status = 'picking';
          picker.equipment = event.equipment;
          picker.currentItem = event.aisle;
          picker.currentLocation = event.fullLocation;
        } else if (event.type === 'return_staging') {
          picker.x = event.x;
          picker.y = event.y;
          picker.status = `returning to ${event.branch}`;
          picker.equipment = 'none';
          picker.currentLocation = null;
        } else if (event.type === 'wrapping') {
          picker.x = event.x;
          picker.y = event.y;
          picker.status = 'wrapping pallet';
          picker.equipment = 'wrapper';
        } else if (event.type === 'wait_equipment') {
          picker.x = event.x;
          picker.y = event.y;
          picker.status = `WAITING for ${event.equipment}`;
        } else if (event.type === 'wait_wrapper') {
          picker.x = event.x;
          picker.y = event.y;
          picker.status = 'WAITING for wrapper';
        } else if (event.type === 'change_equipment') {
          picker.x = event.x;
          picker.y = event.y;
          const equipName = event.equipment === 'pallet_jack' ? 'Pallet Jack' :
                            event.equipment === 'order_picker' ? 'Order Picker' :
                            event.equipment === 'forklift' ? 'Forklift' : event.equipment;
          picker.status = `switching to ${equipName}`;
        } else if (event.type === 'complete_order') {
          picker.x = event.x;
          picker.y = event.y;
          picker.status = 'order complete';
          picker.currentOrder = null;
          picker.equipment = 'none';
          picker.currentLocation = null;
          picker.zoneGroup = null;
        }
      }
    });

    const finalPickerStats = animData.finalPickerStats;
    if (finalPickerStats) {
        states.forEach((s, idx) => {
            const itemsPickedEvents = animData.events.filter(e => e.picker === idx && e.type === 'pick_item' && e.time <= currentTime).length;
            s.itemsPickedToday = itemsPickedEvents;
        });
    }


    return states;
  };

  const zonePickerStates = getPickerStates(zoneAnimation);
  const equipmentPickerStates = getPickerStates(equipmentAnimation);
  
  const maxTime = zoneAnimation && equipmentAnimation 
    ? Math.max(zoneAnimation.totalTime, equipmentAnimation.totalTime)
    : 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50">
      <OrdersListModal 
        isOpen={showOrdersList}
        onClose={() => setShowOrdersList(false)}
        orders={orders}
      />
      
      {showComparisonResults && zoneAnimation && equipmentAnimation && (
        <ComparisonResults 
          zoneData={zoneAnimation}
          equipmentData={equipmentAnimation}
          pickerNames={pickerNames}
          onClose={() => setShowComparisonResults(false)}
        />
      )}

      {activityPicker && (
        <PickerActivityView
            isOpen={activityPicker !== null}
            onClose={() => setActivityPicker(null)}
            picker={(activityPicker.strategy === 'zone' ? zonePickerStates : equipmentPickerStates)[activityPicker.pickerIndex]}
            animationData={activityPicker.strategy === 'zone' ? zoneAnimation : equipmentAnimation}
            currentTime={currentTime}
            pickerColor={pickerColors[activityPicker.pickerIndex]}
        />
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          BR-04 Warehouse Picking Simulator
        </h1>
        <p className="text-gray-600 mb-4">
          Compare two strategies: <strong>Zone-Based</strong> (orders split by zone O1/O2 vs P1, max 2 pickers in O1/O2, pickers skip current line if all equipments are busy and will come back to it later.) 
          vs <strong>Equipment-Based</strong> (whole orders, items grouped by equipment type(height of item) to minimize changes)
        </p>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Settings size={20} />
            General Settings
          </button>

          <button
            onClick={() => setShowPickerConfig(!showPickerConfig)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <Settings size={20} />
            Picker Settings
          </button>

          <button
            onClick={generateNewOrders}
            disabled={animating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 transition-colors"
          >
            <BarChart3 size={20} />
            Generate New Orders
          </button>

          <button
            onClick={() => setShowOrdersList(true)}
            disabled={orders.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 transition-colors"
          >
            <Eye size={20} />
            View Generated Orders
          </button>

          <button
            onClick={startComparison}
            disabled={animating || orders.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-green-500 text-white rounded-lg hover:from-red-600 hover:to-green-600 disabled:bg-gray-400 transition-colors font-bold"
          >
            <GitCompare size={20} />
            Compare Both Strategies
          </button>

          {animating && (
            <>
              <button
                onClick={() => setAnimating(!animating)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                {animating ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                onClick={() => setCurrentTime(maxTime)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium flex items-center gap-1">
              Speed:
              <Tooltip text="Control animation playback speed." />
            </span>
            {[2.5, 5, 10, 20, 40].map(speed => (
              <button
                key={speed}
                onClick={() => setAnimationSpeed(speed)}
                className={`px-3 py-1 rounded text-sm ${animationSpeed === speed ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
              >
                {speed / 10}x
              </button>
            ))}
          </div>

          {spectateMode === null && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-sm font-medium">{(zoom * 100).toFixed(0)}%</span>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ZoomIn size={20} />
              </button>
            </div>
          )}
        </div>

        {showConfig && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border-2 border-blue-200">
            <h3 className="col-span-full text-lg font-bold text-gray-800 mb-2">General Configuration</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                Orders
                <Tooltip text="Number of customer orders to simulate." />
              </label>
              <input
                type="number"
                value={config.numOrders}
                onChange={(e) => setConfig({...config, numOrders: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                O1+O2 Percentage
                <Tooltip text="Percentage of order lines from O1/O2 zones (W1-W5). Higher % = more O1/O2 congestion." />
              </label>
              <input
                type="number"
                value={config.o1o2Percentage}
                onChange={(e) => setConfig({...config, o1o2Percentage: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                Lines per Order (Min)
                <Tooltip text="Minimum number of items per order." />
              </label>
              <input
                type="number"
                value={config.linesPerOrderMin}
                onChange={(e) => setConfig({...config, linesPerOrderMin: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                Lines per Order (Max)
                <Tooltip text="Maximum number of items per order." />
              </label>
              <input
                type="number"
                value={config.linesPerOrderMax}
                onChange={(e) => setConfig({...config, linesPerOrderMax: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                Forklifts
                <Tooltip text="Number of forklifts available." />
              </label>
              <input
                type="number"
                value={config.numForklifts}
                onChange={(e) => setConfig({...config, numForklifts: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                Order Pickers
                <Tooltip text="Number of order picker machines available." />
              </label>
              <input
                type="number"
                value={config.numOrderPickers}
                onChange={(e) => setConfig({...config, numOrderPickers: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                Wrappers
                <Tooltip text="Number of pallet wrapping machines." />
              </label>
              <input
                type="number"
                value={config.numWrappers}
                onChange={(e) => setConfig({...config, numWrappers: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                Equipment Change Time (s)
                <Tooltip text="Time to switch between equipment types. Includes parking one machine and getting another." />
              </label>
              <input
                type="number"
                value={config.equipmentChangeTime}
                onChange={(e) => setConfig({...config, equipmentChangeTime: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                Walk Speed (m/s)
                <Tooltip text="Walking speed with pallet jack. Typical human walking speed is 1.2-1.4 m/s." />
              </label>
              <input
                type="number"
                step="0.1"
                value={config.walkSpeed}
                onChange={(e) => setConfig({...config, walkSpeed: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                Order Picker Speed (m/s)
                <Tooltip text="Order picker machine travel speed." />
              </label>
              <input
                type="number"
                step="0.1"
                value={config.orderPickerSpeed}
                onChange={(e) => setConfig({...config, orderPickerSpeed: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                Forklift Speed (m/s)
                <Tooltip text="Forklift travel speed." />
              </label>
              <input
                type="number"
                step="0.1"
                value={config.forkliftSpeed}
                onChange={(e) => setConfig({...config, forkliftSpeed: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        )}

        {showPickerConfig && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              Picker Configuration
              <Tooltip text="Configure individual picker settings. Zone assignments only apply in Zone-Based mode. Equipment types only apply in Equipment-Based mode." />
            </h3>
            <div className="space-y-4">
              {pickerConfigs.map((picker, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full" style={{backgroundColor: pickerColors[idx]}}></div>
                    <h4 className="font-bold text-gray-800">{picker.name}</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                        Zone Assignment
                        <Tooltip text="Zone-Based only. 'O1/O2 Priority' picks O1/O2 first, then P1. 'Any' picks based on queue length." />
                      </label>
                      <select
                        value={picker.zoneAssignment}
                        onChange={(e) => {
                          const newConfigs = [...pickerConfigs];
                          newConfigs[idx].zoneAssignment = e.target.value;
                          setPickerConfigs(newConfigs);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                      >
                        <option value="O1O2_Priority">O1/O2 Priority</option>
                        <option value="O1O2_Only">O1/O2 Only</option>
                        <option value="P1_Only">P1 Only</option>
                        <option value="Any">Any Zone</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                        Equipment Type
                        <Tooltip text="Equipment-Based only. Determines which equipment this picker is certified to use." />
                      </label>
                      <select
                        value={picker.equipmentType}
                        onChange={(e) => {
                          const newConfigs = [...pickerConfigs];
                          newConfigs[idx].equipmentType = e.target.value;
                          setPickerConfigs(newConfigs);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                      >
                        <option value="all">All Equipment</option>
                        <option value="walk">Walk Only</option>
                        <option value="order_picker">Order Picker</option>
                        <option value="forklift">Forklift</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                        Walk Pick (s)
                        <Tooltip text="Time to pick one item while walking with pallet jack. Includes reaching, scanning, placing." />
                      </label>
                      <input
                        type="number"
                        value={picker.pickTimeWalk}
                        onChange={(e) => {
                          const newConfigs = [...pickerConfigs];
                          newConfigs[idx].pickTimeWalk = parseInt(e.target.value);
                          setPickerConfigs(newConfigs);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                        OP Pick (s)
                        <Tooltip text="Time to pick one item with order picker." />
                      </label>
                      <input
                        type="number"
                        value={picker.pickTimeOP}
                        onChange={(e) => {
                          const newConfigs = [...pickerConfigs];
                          newConfigs[idx].pickTimeOP = parseInt(e.target.value);
                          setPickerConfigs(newConfigs);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                        FL Pick (s)
                        <Tooltip text="Time to pick one item with forklift. Longest due to maneuvering heavy inventories." />
                      </label>
                      <input
                        type="number"
                        value={picker.pickTimeForklift}
                        onChange={(e) => {
                          const newConfigs = [...pickerConfigs];
                          newConfigs[idx].pickTimeForklift = parseInt(e.target.value);
                          setPickerConfigs(newConfigs);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                        Wrap Time (s)
                        <Tooltip text="Time to wrap completed pallet. Includes wrapping, labeling, and moving to staging." />
                      </label>
                      <input
                        type="number"
                        value={picker.wrapTime}
                        onChange={(e) => {
                          const newConfigs = [...pickerConfigs];
                          newConfigs[idx].wrapTime = parseInt(e.target.value);
                          setPickerConfigs(newConfigs);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {comparisonMode && zoneAnimation && equipmentAnimation && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">
                Live Strategy Comparison
              </h3>
              <div className="text-lg font-mono bg-gray-800 text-white px-4 py-2 rounded-md">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} / {Math.floor(maxTime / 60)}:{(maxTime % 60).toFixed(0).padStart(2, '0')}
              </div>
            </div>

            {/* Live Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-300">
                <h4 className="font-bold mb-2 text-blue-900">Zone-Based Progress</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded">
                    <div className="text-xs text-gray-600">Items</div>
                    <div className="text-xl font-bold">{zonePickerStates.reduce((acc, p) => acc + p.itemsPickedToday, 0)}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="text-xs text-gray-600">Orders</div>
                    <div className="text-xl font-bold">{zoneStagedPallets.length}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="text-xs text-gray-600">Progress</div>
                    <div className="text-xl font-bold">{Math.min(100, ((currentTime / zoneAnimation.totalTime) * 100)).toFixed(0)}%</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="text-xs text-gray-600">Status</div>
                    <div className="text-sm font-bold">{currentTime >= zoneAnimation.totalTime ? '✅ Complete' : '🏃 Running'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-300">
                <h4 className="font-bold mb-2 text-purple-900">Equipment-Based Progress</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded">
                    <div className="text-xs text-gray-600">Items</div>
                    <div className="text-xl font-bold">{equipmentPickerStates.reduce((acc, p) => acc + p.itemsPickedToday, 0)}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="text-xs text-gray-600">Orders</div>
                    <div className="text-xl font-bold">{equipmentStagedPallets.length}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="text-xs text-gray-600">Progress</div>
                    <div className="text-xl font-bold">{Math.min(100, ((currentTime / equipmentAnimation.totalTime) * 100)).toFixed(0)}%</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="text-xs text-gray-600">Status</div>
                    <div className="text-sm font-bold">{currentTime >= equipmentAnimation.totalTime ? '✅ Complete' : '🏃 Running'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side by side views */}
            <div className="grid md:grid-cols-2 gap-4">
              <SimulationView
                animationData={zoneAnimation}
                currentTime={currentTime}
                pickerStates={zonePickerStates}
                stagedPallets={zoneStagedPallets}
                pickerPaths={zonePickerPaths}
                zoom={zoom}
                spectateMode={spectateMode}
                showLegend={showLegend}
                title="Zone-Based Strategy"
                config={config}
                pickerConfigs={pickerConfigs}
                pickerColors={pickerColors}
                pickerNames={pickerNames}
                onPickerClick={(pickerIndex) => setActivityPicker({ pickerIndex, strategy: 'zone' })}
              />

              <SimulationView
                animationData={equipmentAnimation}
                currentTime={currentTime}
                pickerStates={equipmentPickerStates}
                stagedPallets={equipmentStagedPallets}
                pickerPaths={equipmentPickerPaths}
                zoom={zoom}
                spectateMode={spectateMode}
                showLegend={showLegend}
                title="Equipment-Based Strategy"
                config={config}
                pickerConfigs={pickerConfigs}
                pickerColors={pickerColors}
                pickerNames={pickerNames}
                onPickerClick={(pickerIndex) => setActivityPicker({ pickerIndex, strategy: 'equipment' })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehousePickingSimulator;

