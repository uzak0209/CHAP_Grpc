#!/usr/bin/env python3
"""
chiVe Word2Vec モデルの次元削減スクリプト
次元数を50に削減します
"""

#!/usr/bin/env python3
"""
chiVe Word2Vec モデルの次元削減スクリプト
次元数を50に削減します
"""

import sys
import numpy as np
from sklearn.decomposition import PCA
import finalfusion

def reduce_dimensions(input_path, output_path, target_dims=50):
    """
    finalfusion 形式の埋め込みを読み込み、PCA で次元削減して保存
    
    Args:
        input_path: 入力ファイルパス (.fifu)
        output_path: 出力ファイルパス (.fifu)
        target_dims: 目標次元数
    """
    print(f"Loading embeddings from {input_path}...")
    embeddings = finalfusion.load_finalfusion(input_path)
    
    original_dims = embeddings.storage.shape[1]
    vocab_size = len(embeddings.vocab)
    print(f"Original dimensions: {original_dims}")
    print(f"Vocabulary size: {vocab_size}")
    
    if original_dims <= target_dims:
        print(f"Warning: Original dimensions ({original_dims}) <= target dimensions ({target_dims})")
        print("No reduction needed. Copying file...")
        import shutil
        shutil.copy(input_path, output_path)
        return
    
    # 埋め込み行列を取得
    print("Extracting embedding matrix...")
    embedding_matrix = embeddings.storage.view()
    
    # PCA で次元削減
    print(f"Applying PCA to reduce to {target_dims} dimensions...")
    pca = PCA(n_components=target_dims)
    reduced_embeddings = pca.fit_transform(embedding_matrix)
    
    explained_var = pca.explained_variance_ratio_.sum()
    print(f"Explained variance ratio: {explained_var:.4f}")
    print(f"New shape: {reduced_embeddings.shape}")
    
    # 新しい埋め込みを作成
    print("Creating new embeddings...")
    from finalfusion.storage import NdArray
    
    new_storage = NdArray(reduced_embeddings.astype(np.float32))
    new_embeddings = finalfusion.Embeddings(
        storage=new_storage, 
        vocab=embeddings.vocab,
        metadata=embeddings.metadata if hasattr(embeddings, 'metadata') else None
    )
    
    # 保存
    print(f"Saving to {output_path}...")
    new_embeddings.write(output_path)
    
    print("Done!")
    print(f"Reduced from {original_dims} to {target_dims} dimensions")
    
    # ファイルサイズを比較
    import os
    original_size = os.path.getsize(input_path) / (1024 * 1024)  # MB
    new_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
    print(f"\nFile size comparison:")
    print(f"  Original: {original_size:.2f} MB")
    print(f"  Reduced:  {new_size:.2f} MB")
    print(f"  Reduction: {(1 - new_size/original_size) * 100:.1f}%")
    
    # ファイルサイズを比較
    import os
    original_size = os.path.getsize(input_path) / (1024 * 1024)  # MB
    new_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
    print(f"\nFile size comparison:")
    print(f"  Original: {original_size:.2f} MB")
    print(f"  Reduced:  {new_size:.2f} MB")
    print(f"  Reduction: {(1 - new_size/original_size) * 100:.1f}%")

if __name__ == "__main__":
    input_file = "chive-1.3-mc100.fifu"
    output_file = "chive-1.3-mc100-dim50.fifu"
    target_dimensions = 30
    
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    if len(sys.argv) > 3:
        target_dimensions = int(sys.argv[3])
    
    print("=" * 60)
    print("chiVe Word2Vec Dimension Reduction")
    print("=" * 60)
    print(f"Input:  {input_file}")
    print(f"Output: {output_file}")
    print(f"Target dimensions: {target_dimensions}")
    print("=" * 60)
    print()
    
    try:
        reduce_dimensions(input_file, output_file, target_dimensions)
    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
