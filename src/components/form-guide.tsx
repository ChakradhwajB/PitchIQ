import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

interface FormGuideProps {
  form: string;
}

const FormResult = ({ result }: { result: string }) => {
    const statusMap: {[key: string]: { label: string, className: string }} = {
        'W': { label: 'Win', className: 'bg-green-500 hover:bg-green-600' },
        'D': { label: 'Draw', className: 'bg-gray-400 hover:bg-gray-500' },
        'L': { label: 'Loss', className: 'bg-red-500 hover:bg-red-600' },
    }
    const { label, className } = statusMap[result] || { label: 'Unknown', className: 'bg-gray-200' };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <div className={cn('h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-bold', className)}>
                        {result}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}


export default function FormGuide({ form }: FormGuideProps) {
  if (!form) return null;
  const results = form.split('');

  return (
    <div className="flex justify-end items-center gap-1">
      {results.map((result, index) => (
        <FormResult key={index} result={result} />
      ))}
    </div>
  );
}
