import CardWrapper from '@/components/common/cardWrapper';

export default function Home() {
  return (
    <div className="w-full">
      <div className="flex justify-center">
        <p className="text-3xl font-bold">Projects</p>
      </div>
      <div className="flex flex-col items-center pt-10">
        <CardWrapper heading="Heading">
          <p>Hello World</p>
        </CardWrapper>
      </div>
    </div>
  );
}
