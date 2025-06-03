// hooks/useDeleteProduct.ts
import { useMutation } from '@tanstack/react-query';
import supabase from '../mocks/supabase';

const deleteProduct = async (productId: number) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (error) {
        throw new Error(error.message);
    }
};

export const useDeleteProduct = () => {

    return useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        },
    });
};
