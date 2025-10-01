import React, { useState, useEffect, useRef } from 'react';
import { Play, Settings, BarChart3, Pause, SkipForward, ZoomIn, ZoomOut, ChevronDown, ChevronUp, Eye, X } from 'lucide-react';

const OrdersPreviewModal = ({ isOpen, onClose, orders, pickerStates, stagedPallets, animationData, pickerColors }) => {
    if (!isOpen) return null;

    const getStatus = (order) => {
        if (!animationData) {
            return <span className="text-gray-500">Not Started</span>;
        }

        if (animationData.method === 'zone') {
            const o1o2PartExists = order.o1o2Lines.length > 0;
            const p1PartExists = order.p1Lines.length > 0;

            let o1o2Status = null;
            if (o1o2PartExists) {
                const partialId = `${order.id}-O1O2`;
                const picker = pickerStates.find(p => p.currentOrder?.includes(`Order ${partialId}`));
                const isCompleted = stagedPallets.some(p => p.orderId === partialId);

                if (isCompleted) o1o2Status = <span className="text-green-600 font-semibold">✅ Completed</span>;
                else if (picker) {
                    const pickerIndex = pickerNames.indexOf(picker.name);
                    o1o2Status = (
                        <span className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: pickerColors[pickerIndex]}}></div>
                            {picker.name}
                        </span>
                    );
                } else o1o2Status = <span className="text-blue-600">Queued</span>;
            }

            let p1Status = null;
            if (p1PartExists) {
                const partialId = `${order.id}-P1`;
                const picker = pickerStates.find(p => p.currentOrder?.includes(`Order ${partialId}`));
                const isCompleted = stagedPallets.some(p => p.orderId === partialId);

                if (isCompleted) p1Status = <span className="text-green-600 font-semibold">✅ Completed</span>;
                else if (picker) {
                    const pickerIndex = pickerNames.indexOf(picker.name);
                    p1Status = (
                        <span className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: pickerColors[pickerIndex]}}></div>
                            {picker.name}
                        </span>
                    );
                } else p1Status = <span className="text-blue-600">Queued</span>;
            }
            
            return (
                <div className="space-y-1">
                    {o1o2PartExists && <div className="text-xs"><strong>O1/O2:</strong> {o1o2Status}</div>}
                    {p1PartExists && <div className="text-xs"><strong>P1:</strong> {p1Status}</div>}
                </div>
            );

        } else { // Equipment mode
            const picker = pickerStates.find(p => p.currentOrder?.includes(`Order ${order.id} `)); // Space to avoid matching order 1 with 10
            const isCompleted = stagedPallets.some(p => p.orderId === order.id);

            if (isCompleted) return <span className="text-green-600 font-semibold">✅ Completed</span>;
            if (picker) {
                 const pickerIndex = pickerNames.indexOf(picker.name);
                 return (
                    <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: pickerColors[pickerIndex]}}></div>
                        {picker.name}
                    </span>
                 );
            }
            return <span className="text-blue-600">Queued</span>;
        }
    };
    
    const pickerNames = ['Scott', 'Jacob', 'Bradley', 'Bao', 'Christian'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">Order Queue & Live Status</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <X size={24} />
                    </button>
                </div>
                <div className="overflow-y-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-3">Order ID</th>
                                <th scope="col" className="px-4 py-3">Branch</th>
                                <th scope="col" className="px-4 py-3 text-center">Total Lines</th>
                                <th scope="col" className="px-4 py-3 text-center">O1/O2 Lines</th>
                                <th scope="col" className="px-4 py-3 text-center">P1 Lines</th>
                                <th scope="col" className="px-4 py-3">Status / Assigned To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{`Order #${order.id}`}</td>
                                    <td className="px-4 py-3">{order.branch}</td>
                                    <td className="px-4 py-3 text-center">{order.lines.length}</td>
                                    <td className="px-4 py-3 text-center">{order.o1o2Lines.length}</td>
                                    <td className="px-4 py-3 text-center">{order.p1Lines.length}</td>
                                    <td className="px-4 py-3">{getStatus(order)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="p-4 border-t bg-gray-50 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                        Close
                    </button>
                </div>
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
    o1o2Percentage: 60, // 60% in O1+O2, 40% in P1
  });

  const [results, setResults] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(10); // Default to 1x speed
  const [currentTime, setCurrentTime] = useState(0);
  const [animationData, setAnimationData] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [stagedPallets, setStagedPallets] = useState([]);
  const [zoom, setZoom] = useState(1.0);
  const [pickerPaths, setPickerPaths] = useState({});
  const [spectateMode, setSpectateMode] = useState(null); // null = overview, or picker index
  const [orders, setOrders] = useState([]);
  const [showOrdersPreview, setShowOrdersPreview] = useState(false);
  const animationRef = useRef(null);

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

  const branches = Object.keys(branchStaging);
  const pickerNames = ['Scott', 'Jacob', 'Bradley', 'Bao', 'Christian'];
  const pickerColors = ['#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'];
  const scottIndex = 0; // Scott is always index 0

  const aislePathX = 3;

  const calculatePathDistance = (pos1, pos2) => {
    const verticalDist = Math.abs(pos1.y - pos2.y);
    const horizontalDist = Math.abs(pos1.x - aislePathX) + Math.abs(pos2.x - aislePathX);
    return verticalDist + horizontalDist;
  };

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
    
    // Split into O1+O2 vs P1 based on percentage
    const o1o2Count = Math.round(linesCount * (config.o1o2Percentage / 100));
    const p1Count = linesCount - o1o2Count;

    const lines = [];
    const aisleO1O2 = ['W1', 'W2', 'W3', 'W4', 'W5'];
    const aisleP1 = ['W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'B1', 'B2', 'B3', 'B4'];

    // Generate O1+O2 items
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

    // Generate P1 items
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

    // Sort by picking order
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
    setAnimationData(null); // Clear previous simulation results
    setAnimating(false);
    setCurrentTime(0);
  };

  useEffect(() => {
    generateNewOrders();
  }, [config.numOrders]); 

  const generateAnimationData = (method, allOrders) => {

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
      zoneUsage: { O1O2: 0, P1: 0 }
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
                      resources.forklifts[resourceIdx].freeAt = pickTime + config.pickTimeForklift;
                    } else if (line.equipment === 'order_picker') {
                      resourceIdx = findFreeResource('orderPickers', pickTime);
                      resources.orderPickers[resourceIdx].busy = true;
                      resources.orderPickers[resourceIdx].freeAt = pickTime + config.pickTimeOrderPicker;
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
                    
                    const itemPickTime = line.equipment === 'forklift' ? config.pickTimeForklift :
                                        line.equipment === 'order_picker' ? config.pickTimeOrderPicker :
                                        config.pickTimeGround;
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
              resources.wrappers[finalWrapIdx].freeAt = pickTime + config.wrapTime;

              events.push({
                time: pickTime, type: 'wrapping', picker: pickerIdx,
                x: currentPos.x, y: currentPos.y
              });

              pickTime += config.wrapTime;
                  
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
                  
                  const itemPickTime = equipType === 'forklift' ? config.pickTimeForklift :
                                    	 equipType === 'order_picker' ? config.pickTimeOrderPicker :
                                  	 config.pickTimeGround;
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
              resources.wrappers[wrapIdx2].freeAt = pickTime + config.wrapTime;

              events.push({
                time: pickTime,
                type: 'wrapping',
                picker: pickerIdx,
                x: currentPos.x,
                y: currentPos.y
              });

              pickTime += config.wrapTime;

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

  const startAnimation = (method) => {
    const data = generateAnimationData(method, orders);
    setAnimationData(data);
    setCurrentTime(0);
    setStagedPallets([]);
    setPickerPaths({});
    setSpectateMode(null);
    setAnimating(true);
  };

  useEffect(() => {
    if (animating && animationData) {
      animationRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + animationSpeed;
          if (next >= animationData.totalTime) {
            setAnimating(false);
            return animationData.totalTime;
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
  }, [animating, animationSpeed, animationData]);

  useEffect(() => {
    if (animationData) {
      const itemsPicked = animationData.events.filter(e => 
        e.type === 'pick_item' && e.time <= currentTime
      ).length;
      
      const ordersCompleted = animationData.events.filter(e => 
        e.type === 'complete_order' && e.time <= currentTime
      ).length;

      const waitEvents = animationData.events.filter(e => 
        (e.type === 'wait_equipment' || e.type === 'wait_wrapper') && e.time <= currentTime
      );

      const currentWaitTime = waitEvents.reduce((sum, e) => sum + (e.duration || 0), 0);

      const currentPallets = animationData.completedPallets.filter(p => p.completedAt <= currentTime);
      setStagedPallets(currentPallets);

      const paths = {};
      for (let i = 0; i < pickerNames.length; i++) {
        const pickerEvents = animationData.events.filter(e => 
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
      setPickerPaths(paths);

      setLiveStats({
        itemsPicked,
        ordersCompleted,
        waitTime: currentWaitTime,
        progress: (currentTime / animationData.totalTime) * 100
      });
    }
  }, [currentTime, animationData]);

  const getPickerStates = () => {
    if (!animationData) return [];
    
    const states = pickerNames.map((name, idx) => ({
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

    animationData.events.forEach(event => {
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
          picker.itemsPickedToday++;
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

    return states;
  };

  const pickerStates = getPickerStates();

  // Calculate view transform for spectate mode
  const getViewTransform = () => {
    if (spectateMode === null) {
      return { scale: zoom, translateX: 0, translateY: 0 };
    }
    
    const picker = pickerStates[spectateMode];
    if (!picker) return { scale: zoom, translateX: 0, translateY: 0 };
    
    // Center on picker
    const centerX = picker.x * 60 + 150;
    const centerY = picker.y * 60 + 20;
    
    return {
      scale: 1.5, // Zoom in when spectating
      translateX: -centerX + 300,
      translateY: -centerY + 400
    };
  };

  const viewTransform = getViewTransform();

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50">
      <OrdersPreviewModal 
        isOpen={showOrdersPreview}
        onClose={() => setShowOrdersPreview(false)}
        orders={orders}
        pickerStates={pickerStates}
        stagedPallets={stagedPallets}
        animationData={animationData}
        pickerColors={pickerColors}
      />
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">BR-04 Warehouse Picking Simulator</h1>
        <p className="text-gray-600 mb-4">Zone Split: O1+O2 vs P1 | Smart Skip Logic | Spectate Mode | O1/O2 Picker Limit</p>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Settings size={20} />
            Settings
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
          onClick={() => setShowOrdersPreview(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <Eye size={20} />
          Show Orders Preview
        </button>

          <button
            onClick={() => startAnimation('zone')}
            disabled={animating || orders.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors"
          >
            <Play size={20} />
          	Zone-Based (2-Picker Limit)
          </button>

          <button
            onClick={() => startAnimation('equipment')}
            disabled={animating || orders.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
          >
            <Play size={20} />
            Equipment-Based
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
                onClick={() => setCurrentTime(animationData.totalTime)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Speed:</span>
            <button
              onClick={() => setAnimationSpeed(2.5)}
              className={`px-3 py-1 rounded text-xs ${animationSpeed === 2.5 ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
            >
              0.25x
            </button>
            <button
              onClick={() => setAnimationSpeed(5)}
              className={`px-3 py-1 rounded text-xs ${animationSpeed === 5 ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
            >
              0.5x
            </button>
            <button
            	onClick={() => setAnimationSpeed(10)}
            	className={`px-3 py-1 rounded text-sm ${animationSpeed === 10 ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
          	>
          	1x
          	</button>
            <button
            	onClick={() => setAnimationSpeed(20)}
            	className={`px-3 py-1 rounded text-sm ${animationSpeed === 20 ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
          	>
          	2x
          	</button>
            <button
            	onClick={() => setAnimationSpeed(40)}
            	className={`px-3 py-1 rounded text-sm ${animationSpeed === 40 ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
          	>
          	4x
          	</button>
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

        {/* Spectate Mode Controls */}
        {animationData && (
          <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <button
              onClick={() => setSpectateMode(null)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${spectateMode === null ? 'bg-indigo-500 text-white' : 'bg-white border'}`}
            >
              <Eye size={16} />
              Overview
            </button>
            {pickerNames.map((name, idx) => (
              <button
                key={idx}
                onClick={() => setSpectateMode(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${spectateMode === idx ? 'bg-indigo-500 text-white' : 'bg-white border'}`}
              >
                <Eye size={16} />
                {name}
              </button>
            ))}
          </div>
        )}

        {showConfig && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Orders</label>
              <input
                type="number"
                value={config.numOrders}
                onChange={(e) => setConfig({...config, numOrders: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">O1+O2 Percentage</label>
              <input
                type="number"
                value={config.o1o2Percentage}
                onChange={(e) => setConfig({...config, o1o2Percentage: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lines per Order (Min)</label>
              <input
                type="number"
                value={config.linesPerOrderMin}
                onChange={(e) => setConfig({...config, linesPerOrderMin: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
            	<label className="block text-sm font-medium mb-1">Lines per Order (Max)</label>
            	<input
            	type="number"
            	value={config.linesPerOrderMax}
            	onChange={(e) => setConfig({...config, linesPerOrderMax: parseInt(e.target.value)})}
            	className="w-full px-3 py-2 border rounded-md"
          	/>
          	</div>
        	</div>
      	)}

      	{animationData && (
      	<div className="mb-6">
      	<div className="flex justify-between items-center mb-4">
      	<h3 className="text-xl font-bold">
      	{animationData.method === 'zone' ? '🔴 Zone-Based Method' : '🟢 Equipment-Based Method'}
      	{spectateMode !== null && <span className="ml-3 text-purple-600">👁️ Following {pickerNames[spectateMode]}</span>}
      	</h3>
      	<div className="text-sm font-mono bg-gray-800 text-white px-3 py-1 rounded-md">
      	{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} / {Math.floor(animationData.totalTime / 60)}:{(animationData.totalTime % 60).toFixed(0).padStart(2, '0')}
      	</div>
      	</div>

      	{liveStats && (
      	<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      	<div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow">
      	<div className="text-sm opacity-90">Items Picked</div>
      	<div className="text-3xl font-bold">{liveStats.itemsPicked}</div>
      	<div className="text-xs opacity-75">/ {animationData.totalItems} total</div>
      	</div>
      	<div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow">
      	<div className="text-sm opacity-90">Orders Complete</div>
      	<div className="text-3xl font-bold">{liveStats.ordersCompleted}</div>
      	<div className="text-xs opacity-75">/ {animationData.totalOrdersToProcess} total</div>
      	</div>
      	<div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg shadow">
      	<div className="text-sm opacity-90">Wait Time</div>
      	<div className="text-3xl font-bold">{Math.floor(liveStats.waitTime / 60)}</div>
      	<div className="text-xs opacity-75">minutes lost</div>
      	</div>
      	<div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow">
      	<div className="text-sm opacity-90">Progress</div>
      	<div className="text-3xl font-bold">{liveStats.progress.toFixed(0)}%</div>
      	<div className="text-xs opacity-75">complete</div>
      	</div>
      	</div>
      	)}

      	<div className="relative bg-gray-100 rounded-lg p-6 border-2 border-gray-300 overflow-auto" style={{ height: '900px' }}>
      	<div style={{ 
      	transform: `scale(${viewTransform.scale}) translate(${viewTransform.translateX}px, ${viewTransform.translateY}px)`,
      	transformOrigin: 'top left',
      	transition: 'transform 0.3s ease-out',
      	width: `${100/viewTransform.scale}%`, 
      	height: `${100/viewTransform.scale}%` 
      	}}>
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

      	{Object.entries(branchStaging).map(([branch, pos]) => (
      	<div
      	key={branch}
      	className="absolute rounded-lg border-4 flex flex-col items-center justify-center shadow-lg"
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
      	<span className="text-xs text-white">({stagedPallets.filter(p => p.branch === branch).length} 🎁)</span>
      	</div>
      	))}

      	{stagedPallets.map((pallet, idx) => {
      	const stagingPos = branchStaging[pallet.branch];
      	const branchPallets = stagedPallets.filter(p => p.branch === pallet.branch);
      	const palletIndex = branchPallets.indexOf(pallet);
      	const offsetX = (palletIndex % 3) * 15;
      	const offsetY = Math.floor(palletIndex / 3) * 8;
      	return (
      	<div
      	key={idx}
      	className="absolute text-lg"
      	style={{
      	left: `${stagingPos.x * 60 + 20 + offsetX}px`,
      	top: `${stagingPos.y * 60 + 20 + offsetY}px`,
      	}}
      	title={`Order ${pallet.orderId} - ${pallet.branch}`}
      	>
      	🎁
      	</div>
      	);
      	})}

      	{Object.entries(aisleStructure).map(([aisle, data]) => (
      	<div
      	key={aisle}
      	className="absolute rounded-lg border-2 flex items-center justify-center"
      	style={{
      	left: `${data.x * 60 + 150 - (data.length * 2)}px`,
      	top: `${data.y * 60 + 20}px`,
      	width: `${data.length * 4}px`,
      	height: '50px',
      	backgroundColor: data.color,
      	opacity: 0.4,
      	borderColor: 'rgba(0,0,0,0.3)'
      	}}
      	>
      	<div className="text-center">
      	<div className="text-sm font-bold">{aisle}</div>
      	<div className="text-xs">{data.sides === 2 ? '2-side' : '1-side'}</div>
      	</div>
      	</div>
      	))}

      	{Object.entries(pickerPaths).map(([pickerIdx, path]) => (
      	<svg
      	key={pickerIdx}
      	className="absolute pointer-events-none"
      	style={{ left: 0, top: 0, width: '100%', height: '100%' }}
      	>
      	<line
      	x1={path.fromX * 60 + 150}
      	y1={path.fromY * 60 + 45}
      	x2={path.fromX * 60 + 150 + (path.toX - path.fromX) * 60 * path.progress}
      	y2={path.fromY * 60 + 45 + (path.toY - path.fromY) * 60 * path.progress}
      	stroke={pickerColors[pickerIdx]}
      	strokeWidth="3"
      	strokeDasharray="5,5"
      	opacity="0.6"
      	/>
      	</svg>
      	))}

      	{pickerStates.map((picker, idx) => (
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
      	<div
      	className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xl ${spectateMode === idx ? 'border-8 border-yellow-400' : 'border-4 border-white'}`}
      	style={{ backgroundColor: picker.color }}
      	>
      	{picker.name.slice(0, 2)}
      	</div>
      	<div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
      	<div className={`${picker.status.includes('WAITING') ? 'bg-red-600 animate-pulse' : 'bg-black bg-opacity-90'} text-white text-xs px-2 py-1 rounded-md shadow-lg max-w-xs`}>
      	{picker.status}
      	{picker.zoneGroup && <span className="ml-1 text-yellow-300">({picker.zoneGroup})</span>}
      	</div>
      	{picker.currentLocation && (
      	<div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md mt-1 shadow font-mono">
      	{picker.equipment === 'order_picker' && '📦 OP: '}
      	{picker.equipment === 'forklift' && '🚜 FK: '}
      	{picker.equipment === 'walk' && '🚚 PJ: '}
      	{picker.equipment === 'pallet_jack' && '🚚 PJ: '}
      	{picker.currentLocation}
      	</div>
      	)}
      	</div>
      	</div>
      	))}

      	<div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border-2 border-gray-300 text-xs">
      	<button
      	onClick={() => setShowLegend(!showLegend)}
      	className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-t-lg"
      	>
      	<span className="font-bold text-sm">📖 Legend</span>
      	{showLegend ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      	</button>
      	
      	{showLegend && (
      	<div className="p-4 pt-0 space-y-2">
      	<div className="font-bold text-gray-700">Zone Split:</div>
      	<div className="text-xs bg-blue-50 p-2 rounded-md">
      	O1+O2: W1-W5 ({config.o1o2Percentage}%)
      	</div>
    	<div className="text-xs bg-red-50 p-2 rounded-md font-bold">
    	<span className="text-red-600">LIMIT:</span> Only 2 pickers at a time
    	</div>
    	<div className="text-xs bg-green-50 p-2 rounded-md">
    	P1: W6-W12 + B1-B4 ({100-config.o1o2Percentage}%)
    	</div>
    	<div className="text-xs text-gray-600 italic mt-1">
    	Zone-based: Pickers skip items needing busy equipment, pick available items first, return later
    	</div>
    	
    	<div className="border-t border-gray-300 my-2"></div>
    	<div className="font-bold text-gray-700">Equipment:</div>
    	<div>🚜 = Forklift</div>
    	<div>📦 = Order Picker (OP)</div>
    	<div>🚚 = Pallet Jack (PJ)</div>
    	<div>🎁 = Pallet</div>
    	<div className="text-red-600 font-bold">WAITING = Bottleneck!</div>
    	
    	<div className="border-t border-gray-300 my-2"></div>
    	<div className="font-bold text-purple-700">Scott:</div>
    	<div className="text-xs">Always O1+O2 priority</div>
    	<div className="text-xs">Always Order Picker</div>
    	</div>
    	)}
    	</div>
    	</div>
    	</div>

    	<div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
    	{pickerStates.map((picker, idx) => (
    	<div key={idx} className={`bg-white border-2 p-3 rounded-lg shadow ${spectateMode === idx ? 'border-yellow-400 border-4' : 'border-gray-200'}`}>
    	<div className="flex items-center gap-2 mb-2">
    	<div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: picker.color }}>
    	{picker.name.slice(0, 2)}
    	</div>
    	<span className="font-bold text-sm">{picker.name}</span>
    	</div>
    	<div className="text-xs text-gray-600 space-y-1">
    	<div className={picker.status.includes('WAITING') ? 'text-red-600 font-bold' : ''}>
    	{picker.status}
    	</div>
    	{picker.zoneGroup && <div className="font-bold text-purple-600">{picker.zoneGroup}</div>}
    	<div>Items: {picker.itemsPickedToday}</div>
    	{picker.currentOrder && <div className="text-blue-600 font-medium text-xs truncate">{picker.currentOrder}</div>}
    	{picker.currentLocation && (
    	<div className="text-xs font-mono bg-gray-100 p-1 rounded truncate">{picker.currentLocation}</div>
    	)}
    	</div>
    	</div>
    	))}
    	</div>

    	{currentTime >= animationData.totalTime && (
    	<div className="mt-6 p-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border-2 border-indigo-300">
    	<h4 className="text-xl font-bold mb-4">📊 Final Results</h4>
    	<div className="grid md:grid-cols-3 gap-4">
    	<div className="bg-white p-4 rounded-lg shadow">
    	<div className="text-gray-600 text-sm">Total Time</div>
    	<div className="text-2xl font-bold">{(animationData.totalTime / 60).toFixed(1)} min</div>
    	</div>
    	<div className="bg-white p-4 rounded-lg shadow">
    	<div className="text-gray-600 text-sm">Total Items</div>
    	<div className="text-2xl font-bold">{animationData.totalItems}</div>
    	</div>
    	<div className="bg-white p-4 rounded-lg shadow">
    	<div className="text-gray-600 text-sm">Wait Time</div>
    	<div className="text-2xl font-bold text-red-600">{(animationData.totalWaitTime / 60).toFixed(1)} min</div>
    	</div>
    	<div className="bg-white p-4 rounded-lg shadow">
    	<div className="text-gray-600 text-sm">Equipment Waits</div>
    	<div className="text-2xl font-bold">{animationData.equipmentWaitEvents || 0}</div>
    	</div>
    	<div className="bg-white p-4 rounded-lg shadow">
    	<div className="text-gray-600 text-sm">Wrapper Waits</div>
    	<div className="text-2xl font-bold">{animationData.wrapperWaitEvents || 0}</div>
    	</div>
    	<div className="bg-white p-4 rounded-lg shadow">
    	<div className="text-gray-600 text-sm">Productivity</div>
    	<div className="text-2xl font-bold">{(animationData.totalItems / (animationData.totalTime / 60)).toFixed(1)} items/min</div>
    	</div>
    	</div>
        <div className="mt-6 col-span-full">
            <h5 className="text-lg font-bold mb-2 text-gray-800">Picker Performance Details</h5>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Picker</th>
                            <th scope="col" className="px-6 py-3 text-center">Orders</th>
                            <th scope="col" className="px-6 py-3 text-center">Items</th>
                            {animationData.method === 'zone' && <th scope="col" className="px-6 py-3 text-center">O1/O2 Orders</th>}
                            {animationData.method === 'zone' && <th scope="col" className="px-6 py-3 text-center">P1 Orders</th>}
                            <th scope="col" className="px-6 py-3 text-center">Walk Picks</th>
                            <th scope="col" className="px-6 py-3 text-center">OP Picks</th>
                            <th scope="col" className="px-6 py-3 text-center">Forklift Picks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {animationData.finalPickerStats.map((stats, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full" style={{backgroundColor: pickerColors[index]}}></div>
                                  {stats.name}
                                </th>
                                <td className="px-6 py-4 text-center">{stats.ordersCompleted}</td>
                                <td className="px-6 py-4 text-center">{stats.itemsPicked}</td>
                                {animationData.method === 'zone' && <td className="px-6 py-4 text-center">{stats.zoneUsage.O1O2}</td>}
                                {animationData.method === 'zone' && <td className="px-6 py-4 text-center">{stats.zoneUsage.P1}</td>}
                                <td className="px-6 py-4 text-center">{stats.equipmentUsage.walk}</td>
                                <td className="px-6 py-4 text-center">{stats.equipmentUsage.order_picker}</td>
                                <td className="px-6 py-4 text-center">{stats.equipmentUsage.forklift}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    	</div>
    	)}
    	</div>
    	)}
    	</div>
    </div>
  );
};

export default WarehousePickingSimulator;

