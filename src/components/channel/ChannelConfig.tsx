import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useChannelConfig, type ChannelConfig } from "@/contexts/ChannelConfigContext";
import { Camera, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  channelName: z.string().min(2, "Nome muito curto"),
  logoUrl: z.string().url("URL inválida").or(z.literal("")),
  photoUrl: z.string().url("URL inválida").or(z.literal("")),
  tagline: z.string().min(5, "Frase muito curta"),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  youtubeUrl: z.string().url("URL inválida"),
});

type FormValues = z.infer<typeof schema>;

export function ChannelConfig() {
  const { config, updateConfig, resetConfig } = useChannelConfig();

  const { register, handleSubmit, watch, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: config,
  });

  const watched = watch();

  const onSubmit = (data: FormValues) => {
    updateConfig(data as Partial<ChannelConfig>);
    toast.success("Configurações salvas!");
  };

  const onReset = () => {
    resetConfig();
    toast.success("Configurações restauradas!");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-amber-200 p-6 shadow-sm">
        <h3 className="font-black text-xl text-gray-900 mb-1">Personalização do Canal</h3>
        <p className="text-sm text-gray-500 mb-6">Configure a identidade do seu canal para aparecer em todo o site e no PDF.</p>

        {/* Preview */}
        <div
          className="rounded-2xl p-4 mb-6 flex items-center gap-4 text-white shadow-md"
          style={{ background: `linear-gradient(135deg, ${watched.primaryColor}, ${watched.secondaryColor})` }}
        >
          <div className="shrink-0">
            {watched.logoUrl ? (
              <img
                src={watched.logoUrl}
                alt="Logo"
                className="h-12 w-12 rounded-xl object-cover ring-2 ring-white/40"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Camera className="h-6 w-6" />
              </div>
            )}
          </div>
          <div>
            <div className="font-black text-lg">{watched.channelName || "Nome do Canal"}</div>
            <div className="text-sm opacity-80">{watched.tagline || "Frase de chamada"}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Canal</label>
              <input
                {...register("channelName")}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Luana Queiroz e Família"
              />
              {errors.channelName && (
                <p className="text-xs text-red-500 mt-1">{errors.channelName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">URL do YouTube</label>
              <input
                {...register("youtubeUrl")}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="https://www.youtube.com/@..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Frase de chamada</label>
              <input
                {...register("tagline")}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Monte seu chaveamento da Copa com a família!"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">URL da Logo</label>
              <input
                {...register("logoUrl")}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">URL da Foto Principal</label>
              <input
                {...register("photoUrl")}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Cor Principal</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register("primaryColor")}
                  className="h-10 w-16 rounded-lg border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{watched.primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Cor Secundária</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register("secondaryColor")}
                  className="h-10 w-16 rounded-lg border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{watched.secondaryColor}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!isDirty}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
              id="channel-config-save-btn"
            >
              <Save className="h-4 w-4" /> Salvar
            </button>
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              id="channel-config-reset-btn"
            >
              <RotateCcw className="h-4 w-4" /> Restaurar padrão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
