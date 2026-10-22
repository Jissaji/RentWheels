import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Fuel, Gauge, Users, Calendar, ArrowRight, Tag } from 'lucide-react';
import { formatINR } from '../utils/formatters';
import StatusBadge from './StatusBadge';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80';

const CarCard = ({ car, onBookNow }) => {
  const [imgSrc, setImgSrc] = useState(car.image);
  const isAvailable = car.status === 'Available';

  return (
    <div className="group relative flex flex-col rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10">
      {/* Car Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          src={imgSrc}
          alt={`${car.brand} ${car.model}`}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {car.category && (
            <span className="bg-slate-950/80 backdrop-blur border border-slate-700 text-blue-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              {car.category}
            </span>
          )}
          <StatusBadge status={car.status} />
        </div>

        {/* Featured Tag */}
        {Boolean(car.is_featured) && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
            Featured
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">
              {car.brand}
            </span>
            <h3 className="text-lg font-bold truncate">
              {car.model}
            </h3>
          </div>
          <span className="text-xs text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur">
            {car.year}
          </span>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Fuel className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{car.fuel_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{car.transmission}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{car.seats} Seats</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{car.mileage || '16 km/l'}</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-4 flex items-center justify-between pt-1">
          <div>
            <div className="text-xs text-slate-400 font-medium">Daily Rental</div>
            <div className="text-xl font-extrabold text-white tracking-tight">
              {formatINR(car.price_per_day)}
              <span className="text-xs font-normal text-slate-400"> / day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/cars/${car.car_id}`}
              className="px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Details
            </Link>
            {isAvailable ? (
              <button
                onClick={() => onBookNow ? onBookNow(car) : null}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/20 transition-all hover:gap-2"
              >
                Book
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                disabled
                className="px-3 py-2 text-xs font-medium text-slate-500 bg-slate-800/50 rounded-xl cursor-not-allowed"
              >
                {car.status === 'Rented' ? 'Reserved' : 'Unavailable'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
