export interface IslamicOccasion {
  id: string;
  nameAr: string;
  nameEn: string;
  hijriMonth: number; // 1-indexed (1 = Muharram, 9 = Ramadan, 12 = Dhul-Hijjah)
  hijriDay: number;
  descriptionAr: string;
  descriptionEn: string;
  recommendedActionAr: string;
  recommendedActionEn: string;
}

export const ISLAMIC_OCCASIONS: IslamicOccasion[] = [
  {
    id: 'muharram-ashura',
    nameAr: 'يوم عاشوراء (10 محرم)',
    nameEn: 'Day of Ashura (10th Muharram)',
    hijriMonth: 1,
    hijriDay: 10,
    descriptionAr: 'اليوم الذي نجّى الله فيه موسى وقومه وأغرق فرعون وجنده.',
    descriptionEn: 'The day Allah saved Prophet Musa and drowned Pharaoh and his army.',
    recommendedActionAr: 'يُستحب صيامه مع صيام يوم قبله (تاسوعاء) تكفيراً لذنوب سنة ماضية.',
    recommendedActionEn: 'Fasting is recommended along with the 9th day, expiating sins of the previous year.',
  },
  {
    id: 'rajab-isra',
    nameAr: 'ذكرى الإسراء والمعراج (27 رجب)',
    nameEn: 'Isra & Mi’raj (27th Rajab)',
    hijriMonth: 7,
    hijriDay: 27,
    descriptionAr: 'معجزة إسرائه ﷺ من المسجد الحرام إلى المسجد الأقصى وعروجه إلى السماوات العلا وفرض الصلوات الخمس.',
    descriptionEn: 'The miraculous night journey from Makkah to Jerusalem and ascension to the heavens.',
    recommendedActionAr: 'تدبر عظمة فريضة الصلاة والتقرب بالنوافل والذكر.',
    recommendedActionEn: 'Reflecting on the obligation of prayer and increasing voluntary worship.',
  },
  {
    id: 'shaban-mid',
    nameAr: 'ليلة النصف من شعبان (15 شعبان)',
    nameEn: 'Mid-Sha’ban (15th Sha’ban)',
    hijriMonth: 8,
    hijriDay: 15,
    descriptionAr: 'ليلة مباركة يطّلع الله فيها إلى خلقه فيغفر للمؤمنين إلا لمشرك أو مشاحن.',
    descriptionEn: 'A night of divine mercy where Allah forgives His servants except those associating partners or holding grudges.',
    recommendedActionAr: 'تطهير القلوب من الشحناء والإكثار من الاستغفار والصيام في شعبان.',
    recommendedActionEn: 'Cleansing the heart of hatred and increasing forgiveness and fasting in Sha’ban.',
  },
  {
    id: 'ramadan-start',
    nameAr: 'غرة شهر رمضان المبارك (1 رمضان)',
    nameEn: '1st of Ramadan',
    hijriMonth: 9,
    hijriDay: 1,
    descriptionAr: 'بداية شهر الصيام والقرآن، تُفتح فيه أبواب الجنان وتُصفد فيه الشياطين.',
    descriptionEn: 'Beginning of the blessed month of fasting, forgiveness, and Quran revelation.',
    recommendedActionAr: 'تجديد النية لصيام الشهر وقيامه وتلاوة القرآن وتفطير الصائمين.',
    recommendedActionEn: 'Renewing sincere intention for fasting, Qiyam, and charity.',
  },
  {
    id: 'ramadan-laylat-qadr',
    nameAr: 'ليلة القدر (العشر الأواخر من رمضان)',
    nameEn: 'Laylat al-Qadr (The Night of Decree)',
    hijriMonth: 9,
    hijriDay: 27,
    descriptionAr: 'خير من ألف شهر، تنزل فيها الملائكة والروح بإذن ربهم من كل أمر، سلام هي حتى مطلع الفجر.',
    descriptionEn: 'Better than a thousand months, marked by peace and angelic descent.',
    recommendedActionAr: 'الاعتكاف، قيام الليل، ودعاء «اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي».',
    recommendedActionEn: 'Night vigil, sincere repentance, and supplication for divine pardon.',
  },
  {
    id: 'shawwal-eid-fitr',
    nameAr: 'عيد الفطر المبارك (1 شوال)',
    nameEn: 'Eid al-Fitr (1st Shawwal)',
    hijriMonth: 10,
    hijriDay: 1,
    descriptionAr: 'يوم الجائزة والفرح بإتمام فريضة الصيام وصلة الأرحام وإخراج زكاة الفطر.',
    descriptionEn: 'Celebration of completing Ramadan fasting, charity, and familial ties.',
    recommendedActionAr: 'صلاة العيد، التكبير، إدخال السرور على الأهل والفقراء، ثم صيام ست من شوال.',
    recommendedActionEn: 'Attending Eid prayer, joyous gatherings, charity, and subsequent six days of Shawwal.',
  },
  {
    id: 'dhulhijjah-arafah',
    nameAr: 'يوم عرفة المبارك (9 ذو الحجة)',
    nameEn: 'Day of Arafah (9th Dhul-Hijjah)',
    hijriMonth: 12,
    hijriDay: 9,
    descriptionAr: 'أعظم أيام الدهر، وركن الحج الأكبر، وما رؤي الشيطان أصغر ولا أحقر منه في يوم عرفة.',
    descriptionEn: 'The pinnacle day of Hajj and supreme day of divine forgiveness.',
    recommendedActionAr: 'صيامه لغير الحاج يكفر سنتين، مع الإكثار من الدعاء والتهليل والتكبير.',
    recommendedActionEn: 'Fasting for non-pilgrims expiates two years of sins; abundance of supplication and Dhikr.',
  },
  {
    id: 'dhulhijjah-eid-adha',
    nameAr: 'عيد الأضحى المبارك ويوم النحر (10 ذو الحجة)',
    nameEn: 'Eid al-Adha (10th Dhul-Hijjah)',
    hijriMonth: 12,
    hijriDay: 10,
    descriptionAr: 'يوم الحج الأكبر وذبح الأضاحي اتباعاً لسنة أبينا إبراهيم ونبينا محمد ﷺ.',
    descriptionEn: 'The Feast of Sacrifice honoring the obedience of Prophet Ibrahim.',
    recommendedActionAr: 'صلاة العيد، ذبح الأضحية، التكبير المقيد والمطلق، والتوسعة على الأهل والمساكين.',
    recommendedActionEn: 'Eid prayer, sacrificing an animal, charitable distribution, and festive joy.',
  },
];
