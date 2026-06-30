import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSimulator } from "@/contexts/SimulatorContext";
import { YouTubeButton } from "@/components/common/YouTubeButton";
import { User, MapPin, Youtube, FileText, Baby } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Nome muito curto").max(80, "Nome muito longo"),
  city: z.string().min(2, "Cidade muito curta").max(60, "Cidade muito longa"),
  channelSubscribed: z.boolean().refine((v) => v, {
    message: "Confirme sua inscrição no canal para participar.",
  }),
  termsAccepted: z.boolean().refine((v) => v, {
    message: "Você precisa aceitar o regulamento.",
  }),
});

type FormValues = z.infer<typeof schema>;

interface ParticipantFormProps {
  onConfirm: () => void;
}

export function ParticipantForm({ onConfirm }: ParticipantFormProps) {
  const { state, setParticipant, setChannelSubscribed, setTermsAccepted, setFormSubmitted } =
    useSimulator();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: state.participantName,
      city: state.participantCity,
      channelSubscribed: state.channelSubscribed,
      termsAccepted: state.termsAccepted,
    },
  });

  const channelSubscribed = watch("channelSubscribed");
  const termsAccepted = watch("termsAccepted");

  const onSubmit = (data: FormValues) => {
    setParticipant(data.name, data.city);
    setChannelSubscribed(data.channelSubscribed);
    setTermsAccepted(data.termsAccepted);
    setFormSubmitted(true);
    onConfirm();
  };

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-white p-6 shadow-lg">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">⚽</div>
        <h2 className="text-2xl font-black text-gray-900 mb-1">Quem é você?</h2>
        <p className="text-sm text-gray-500">
          Preencha seus dados para participar do Desafio da Copa e aparecer no Ranking da Família!
        </p>
      </div>

      {/* Child warning */}
      <div className="flex items-start gap-3 rounded-2xl bg-blue-50 border border-blue-200 p-4 mb-5">
        <Baby className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          <strong>Se você é criança,</strong> peça ajuda a um responsável para participar. 😊
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="participant-form">
        {/* Name */}
        <div>
          <label
            htmlFor="participant-name"
            className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1"
          >
            <User className="h-4 w-4 text-amber-500" />
            Seu nome <span className="text-red-500">*</span>
          </label>
          <input
            id="participant-name"
            {...register("name")}
            className={cn(
              "w-full rounded-xl border-2 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all",
              errors.name ? "border-red-400 bg-red-50" : "border-gray-200 bg-white",
            )}
            placeholder="Ex: Maria da Silva"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name.message}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label
            htmlFor="participant-city"
            className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1"
          >
            <MapPin className="h-4 w-4 text-amber-500" />
            Sua cidade <span className="text-red-500">*</span>
          </label>
          <input
            id="participant-city"
            {...register("city")}
            className={cn(
              "w-full rounded-xl border-2 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all",
              errors.city ? "border-red-400 bg-red-50" : "border-gray-200 bg-white",
            )}
            placeholder="Ex: São Paulo - SP"
          />
          {errors.city && (
            <p className="text-xs text-red-500 mt-1 font-semibold">{errors.city.message}</p>
          )}
        </div>

        <div className="pt-2 pb-1">
          <div className="h-px bg-amber-100" />
        </div>

        {/* YouTube subscription */}
        <div className="space-y-3">
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-gray-700 font-semibold mb-3">
              <Youtube className="inline h-4 w-4 text-red-500 mr-1" />
              Para participar, você precisa estar inscrito no canal:
            </p>
            <YouTubeButton variant="compact" className="w-full justify-center mb-3" label="Inscrever-se no canal" />
            <p className="text-xs text-gray-500 text-center italic">
              Depois de se inscrever, volte aqui e confirme sua participação.
            </p>
          </div>

          <label
            className={cn(
              "flex items-start gap-3 rounded-xl border-2 p-3.5 cursor-pointer transition-all",
              channelSubscribed
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-white hover:border-red-300",
            )}
          >
            <input
              type="checkbox"
              id="channel-subscribed-checkbox"
              {...register("channelSubscribed")}
              onChange={(e) => {
                setValue("channelSubscribed", e.target.checked);
                setChannelSubscribed(e.target.checked);
              }}
              className="h-4 w-4 mt-0.5 rounded accent-red-500 shrink-0"
            />
            <span className="text-sm font-semibold text-gray-700 leading-tight">
              Confirmo que estou inscrito(a) no canal{" "}
              <span className="text-red-600">Luana Queiroz e Família</span> no YouTube.
            </span>
          </label>
          {errors.channelSubscribed && (
            <p className="text-xs text-red-500 font-semibold">{errors.channelSubscribed.message}</p>
          )}
        </div>

        {/* Terms */}
        <div>
          <label
            className={cn(
              "flex items-start gap-3 rounded-xl border-2 p-3.5 cursor-pointer transition-all",
              termsAccepted
                ? "border-green-400 bg-green-50"
                : "border-gray-200 bg-white hover:border-green-300",
            )}
          >
            <input
              type="checkbox"
              id="terms-accepted-checkbox"
              {...register("termsAccepted")}
              onChange={(e) => {
                setValue("termsAccepted", e.target.checked);
                setTermsAccepted(e.target.checked);
              }}
              className="h-4 w-4 mt-0.5 rounded accent-green-500 shrink-0"
            />
            <span className="text-sm font-semibold text-gray-700 leading-tight">
              <FileText className="inline h-4 w-4 text-green-600 mr-1" />
              Li e aceito o{" "}
              <a href="/regulamento" target="_blank" className="text-green-600 underline hover:text-green-700">
                regulamento do desafio
              </a>
              .
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="text-xs text-red-500 font-semibold">{errors.termsAccepted.message}</p>
          )}
        </div>

        {/* Privacy notice */}
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          🔒 Usaremos seu nome e cidade apenas para identificar sua participação no ranking do desafio.
          Nenhum dado sensível será solicitado.
        </p>

        {/* Submit */}
        <button
          type="submit"
          id="participant-form-submit-btn"
          className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3.5 text-base font-black text-white shadow-lg hover:from-amber-600 hover:to-yellow-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all"
        >
          ⚽ Montar meu palpite!
        </button>
      </form>
    </div>
  );
}
