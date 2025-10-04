import { Award, BarChart3, Calendar, Globe, PieChart, Shield, Smartphone, Target, TrendingUp } from 'lucide-react';
import React from 'react'
import { colors } from '@/styles/colors'

export default function Features() {
  const features = [
    {
      icon: PieChart,
      title: "Fitantanana Tetibola",
      description: "Manomana sy manaraka ny tetibolanao isam-bolana miaraka amin'ny fampandrenesana marani-tsaina"
    },
    {
      icon: TrendingUp,
      title: "Fanaraha-maso ny Fidiram-bola",
      description: "Analisao ny loharanon'ny fidiram-bolanao ary ampatsaro ny fidiran'ny vola"
    },
    {
      icon: Target,
      title: "Tanjona Fitahirizana",
      description: "Farito sy hatraho ny tanjonanao ara-bola miaraka amin'ny fanaraha-maso hita maso"
    },
    {
      icon: Calendar,
      title: "Fitantanana Famandrihana",
      description: "Aza adino intsony ny fe-potoana miaraka amin'ny fampahatsiahavanay mandeha ho azy"
    },
    {
      icon: BarChart3,
      title: "Famakafakana Amin'ny Antsipiriany",
      description: "Jereo ny fahazaranao ara-bola miaraka amin'ny sary an-tsary interactive"
    },
    {
      icon: Shield,
      title: "Fiarovana Tanteraka",
      description: "Ny angon-drakitrao dia mijanona ho tsy miharihary sy voaaro amin'ny fitaovanao"
    },
    {
      icon: Smartphone,
      title: "Fampiasana Mora",
      description: "Interface tsotra sy mora ampiasaina ho an'ny rehetra"
    },
    {
      icon: Globe,
      title: "Manerantany",
      description: "Manohana vola maro samihafa sy fiteny maro"
    },
    {
      icon: Award,
      title: "Mendrika Mahatoky",
      description: "Nahazo mari-pankasitrahana maro avy amin'ny mpampiasa"
    }
  ];
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Izay rehetra ilainao
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fitaovana mahery sy tsotra hanovana ny fifandraianao amin'ny vola
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border group"
                style={{ backgroundColor: colors.white, borderColor: colors.light }}
              >
                <div className="rounded-xl p-3 w-fit mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: colors.secondary }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}
